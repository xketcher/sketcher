#include <jni.h>

// XOR encrypted "Hello from native library!"
const unsigned char raw[] = {
    0x1d, 0x30, 0x39, 0x39, 0x3a, 0x75, 0x33, 0x27, 0x3a, 0x38,
    0x75, 0x3b, 0x34, 0x21, 0x3c, 0x23, 0x30, 0x75, 0x39, 0x3c,
    0x37, 0x27, 0x34, 0x27, 0x2c, 0x74, 0x00
};

char* decrypt() {
    static char buf[64];
    int i = 0;
    while (raw[i] != 0x00 && i < (int)(sizeof(buf) - 1)) {
        buf[i] = raw[i] ^ 0x55;  // XOR decrypt
        i++;
    }
    buf[i] = '\0'; // null-terminate
    return buf;
}

JNIEXPORT jstring JNICALL
Java_com_my_app_MainActivity_stringFromNative(JNIEnv* env, jobject obj) {
    return (*env)->NewStringUTF(env, decrypt());
}