#include <jni.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <unistd.h>
#include <sys/mman.h>
#include <pthread.h>
#include <android/log.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <openssl/evp.h>
#include <openssl/sha.h>
#include <openssl/err.h>

#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, "sec", __VA_ARGS__)

#define SALT_LEN 16
#define IV_LEN 16
#define KEY_LEN 32
#define PBKDF2_ITERS 65536

typedef struct {
    void* addr;
    size_t len;
} alloc_entry;

#define MAX_ALLOCS 256
static alloc_entry g_allocs[MAX_ALLOCS];
static pthread_mutex_t g_alloc_lock = PTHREAD_MUTEX_INITIALIZER;

static void track_alloc(void* a, size_t l) {
    pthread_mutex_lock(&g_alloc_lock);
    for (int i=0;i<MAX_ALLOCS;i++){
        if (g_allocs[i].addr == NULL) { g_allocs[i].addr = a; g_allocs[i].len = l; break; }
    }
    pthread_mutex_unlock(&g_alloc_lock);
}

static size_t untrack_alloc(void* a) {
    size_t len = 0;
    pthread_mutex_lock(&g_alloc_lock);
    for (int i=0;i<MAX_ALLOCS;i++){
        if (g_allocs[i].addr == a) { len = g_allocs[i].len; g_allocs[i].addr = NULL; g_allocs[i].len = 0; break; }
    }
    pthread_mutex_unlock(&g_alloc_lock);
    return len;
}

static void secure_memzero(void* p, size_t n) {
    if (p) {
        volatile unsigned char *q = (volatile unsigned char*)p;
        while (n--) *q++ = 0;
    }
}

// AES-256-CBC decrypt using OpenSSL EVP
static int aes256_cbc_decrypt(const unsigned char* in, int in_len,
                              unsigned char* out, int* out_len,
                              const unsigned char* key, const unsigned char* iv) {
    int ret = 0;
    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) return 0;
    if (1 != EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv)) goto end;

    int len = 0;
    int plaintext_len = 0;

    if (1 != EVP_DecryptUpdate(ctx, out, &len, in, in_len)) goto end;
    plaintext_len = len;

    if (1 != EVP_DecryptFinal_ex(ctx, out + len, &len)) goto end;
    plaintext_len += len;

    *out_len = plaintext_len;
    ret = 1;

end:
    EVP_CIPHER_CTX_free(ctx);
    return ret;
}

JNIEXPORT jobject JNICALL
Java_com_my_heybook_NativeLib_decryptFdToDirectBuffer(JNIEnv* env, jclass cls,
                                                     jint fd, jlong offset, jlong length,
                                                     jbyteArray secretArray) {
    if (fd < 0 || length <= 0 || secretArray == NULL) return NULL;

    jsize secret_len = (*env)->GetArrayLength(env, secretArray);
    jbyte* secret_bytes = (*env)->GetByteArrayElements(env, secretArray, NULL);
    if (!secret_bytes) return NULL;

    // read salt + iv first from fd at offset
    off_t off = (off_t) offset;
    if (lseek(fd, off, SEEK_SET) == (off_t)-1) { (*env)->ReleaseByteArrayElements(env, secretArray, secret_bytes, JNI_ABORT); return NULL; }

    unsigned char salt[SALT_LEN];
    unsigned char iv[IV_LEN];
    ssize_t rr = read(fd, salt, SALT_LEN);
    if (rr != SALT_LEN) { (*env)->ReleaseByteArrayElements(env, secretArray, secret_bytes, JNI_ABORT); return NULL; }
    rr = read(fd, iv, IV_LEN);
    if (rr != IV_LEN) { (*env)->ReleaseByteArrayElements(env, secretArray, secret_bytes, JNI_ABORT); return NULL; }

    // remaining ciphertext length
    long ciph_len = (long)length - SALT_LEN - IV_LEN;
    if (ciph_len <= 0) { (*env)->ReleaseByteArrayElements(env, secretArray, secret_bytes, JNI_ABORT); return NULL; }

    // allocate buffer for ciphertext in native heap
    unsigned char* ciph_buf = (unsigned char*) malloc((size_t)ciph_len);
    if (!ciph_buf) { (*env)->ReleaseByteArrayElements(env, secretArray, secret_bytes, JNI_ABORT); return NULL; }

    // read ciphertext
    size_t toread = (size_t)ciph_len;
    unsigned char* p = ciph_buf;
    while (toread > 0) {
        ssize_t r = read(fd, p, toread);
        if (r <= 0) { free(ciph_buf); (*env)->ReleaseByteArrayElements(env, secretArray, secret_bytes, JNI_ABORT); return NULL; }
        p += r; toread -= r;
    }

    // derive key with PBKDF2 HMAC-SHA256
    unsigned char key[KEY_LEN];
    if (!PKCS5_PBKDF2_HMAC((const char*)secret_bytes, (int)secret_len,
                           salt, SALT_LEN, PBKDF2_ITERS, EVP_sha256(), KEY_LEN, key)) {
        secure_memzero(ciph_buf, ciph_len);
        free(ciph_buf);
        (*env)->ReleaseByteArrayElements(env, secretArray, secret_bytes, JNI_ABORT);
        return NULL;
    }

    // release Java secret immediately (we keep native key only)
    (*env)->ReleaseByteArrayElements(env, secretArray, secret_bytes, JNI_ABORT);

    // allocate output buffer (ciphertext size is upper bound)
    unsigned char* out_buf = (unsigned char*) malloc((size_t)ciph_len + 16);
    if (!out_buf) {
        secure_memzero(key, KEY_LEN);
        secure_memzero(ciph_buf, ciph_len);
        free(ciph_buf);
        return NULL;
    }

    // optionally lock out_buf into RAM
    mlock(out_buf, (size_t)ciph_len + 16);

    int out_len = 0;
    int ok = aes256_cbc_decrypt(ciph_buf, (int)ciph_len, out_buf, &out_len, key, iv);

    // wipe and free ciphertext buffer
    secure_memzero(ciph_buf, ciph_len);
    free(ciph_buf);

    // wipe key material
    secure_memzero(key, KEY_LEN);

    if (!ok) {
        secure_memzero(out_buf, (size_t)ciph_len + 16);
        munlock(out_buf, (size_t)ciph_len + 16);
        free(out_buf);
        return NULL;
    }

    // track allocation for release
    track_alloc(out_buf, (size_t)out_len);

    // return DirectByteBuffer backed by native memory
    jobject direct = (*env)->NewDirectByteBuffer(env, out_buf, (jlong) out_len);
    return direct;
}

JNIEXPORT void JNICALL
Java_com_my_heybook_NativeLib_releaseDirectBuffer(JNIEnv* env, jclass cls, jobject byteBuffer) {
    if (byteBuffer == NULL) return;
    void* addr = (*env)->GetDirectBufferAddress(env, byteBuffer);
    if (!addr) return;

    size_t len = untrack_alloc(addr);
    if (len == 0) {
        // best-effort wipe small area
        secure_memzero(addr, 4096);
        munlock(addr, 4096);
        free(addr);
        return;
    }

    secure_memzero(addr, len);
    munlock(addr, len);
    free(addr);
}
