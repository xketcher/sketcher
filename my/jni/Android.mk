LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE    := sec
LOCAL_SRC_FILES := sec.c

# link OpenSSL + Android log
LOCAL_LDLIBS    := -llog -lcrypto -lm

LOCAL_CFLAGS    := -fPIC -O2 -Wall -Wextra -std=c11

include $(BUILD_SHARED_LIBRARY)
