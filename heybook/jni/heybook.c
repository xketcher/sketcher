#include <jni.h>
#include <string.h>
#include <stdlib.h>

static const unsigned char raw1[] = {0x67,0x6d,0x64,0x11,0x6c,0x30,0x27,0x19,0x26,0x2f,0x3c,0x27,0x23,0x17,0x00};
static const unsigned char raw2[] = {0x2d,0x26,0x0d,0x0d,0x3a,0x02,0x62,0x33,0x14,0x6c,0x14,0x32,0x25,0x23,0x3b,0x00};
static const unsigned char raw3[] = {0x19,0x0d,0x1f,0x64,0x26,0x19,0x21,0x6c,0x11,0x25,0x27,0x23,0x37,0x60,0x32,0x00};
static const unsigned char raw4[] = {0x64,0x63,0x26,0x34,0x04,0x12,0x20,0x7a,0x36,0x66,0x1b,0x17,0x23,0x25,0x10,0x18,0x0f,0x14,0x02,0x67,0x34,0x21,0x36,0x1c,0x3d,0x1d,0x2c,0x3c,0x11,0x36,0x05,0x31,0x16,0x18,0x7a,0x33,0x31,0x6d,0x10,0x36,0x67,0x65,0x23,0x20,0x3a,0x3c,0x1a,0x3d,0x3b,0x16,0x1c,0x7a,0x3c,0x30,0x3b,0x3f,0x0c,0x20,0x18,0x24,0x24,0x30,0x2c,0x7a,0x00};

static char* d(const unsigned char* r){
    size_t len=0; while(r[len]) len++;
    char* out=(char*)malloc(len+1);
    for(size_t i=0;i<len;i++) out[i]=r[i]^0x55;
    out[len]='\0';
    return out;
}

JNIEXPORT jstring JNICALL
Java_com_my_heybook_ShaUtil_getSecret(JNIEnv* env,jclass clazz,jobject context,jstring s1){
    char *d1=d(raw1),*d2=d(raw2),*d3=d(raw3),*d4=d(raw4);

    jclass encCls=(*env)->FindClass(env,"com/my/heybook/Encryption");
    jmethodID ctor=(*env)->GetMethodID(env,encCls,"<init>","(Ljava/lang/String;)V");
    jmethodID decryptMid=(*env)->GetMethodID(env,encCls,"decrypt","(Ljava/lang/String;)Ljava/lang/String;");
    jobject encObj=(*env)->NewObject(env,encCls,ctor,(*env)->NewStringUTF(env,d3));
    jstring js2=(jstring)(*env)->CallObjectMethod(env,encObj,decryptMid,(*env)->NewStringUTF(env,d4));
    const char* s2=js2?(*env)->GetStringUTFChars(env,js2,NULL):"";

    jclass shaCls=(*env)->FindClass(env,"com/my/heybook/ShaUtil");
    jmethodID sigMid=(*env)->GetStaticMethodID(env,shaCls,"getAppSignature",
                        "(Landroid/content/Context;Ljava/lang/String;)Ljava/lang/String;");

    const char* order[]={"SHA-1","MD5","SHA-256","MD5","SHA-256","SHA-384","SHA-384",
                         "RAW2","SHA-384","MD5","SHA-512","SHA-1","RAW1","MD5","SHA-512","SHA-256","SHA-512","SHA-1"};

    char buffer[4096]={0};
    const char* cs1=s1?(*env)->GetStringUTFChars(env,s1,NULL):"";
    strcat(buffer,cs1);

    for(int i=0;i<18;i++){
        if(strcmp(order[i],"RAW2")==0) strcat(buffer,d2);
        else if(strcmp(order[i],"RAW1")==0) strcat(buffer,d1);
        else{
            jstring sig=(jstring)(*env)->CallStaticObjectMethod(env,shaCls,sigMid,context,(*env)->NewStringUTF(env,order[i]));
            const char* sigstr=sig?(*env)->GetStringUTFChars(env,sig,NULL):"";
            strcat(buffer,sigstr);
            if(sig)(*env)->ReleaseStringUTFChars(env,sig,sigstr);
        }
    }

    strcat(buffer,s2);

    jstring out=(*env)->NewStringUTF(env,buffer);
    if(s1)(*env)->ReleaseStringUTFChars(env,s1,cs1);
    if(js2)(*env)->ReleaseStringUTFChars(env,js2,s2);
    free(d1); free(d2); free(d3); free(d4);
    return out;
}