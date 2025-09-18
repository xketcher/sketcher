LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE    := native
LOCAL_SRC_FILES := native_code.c

include $(BUILD_SHARED_LIBRARY)
