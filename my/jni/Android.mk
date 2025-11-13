LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE    := dex
LOCAL_SRC_FILES := dex.c
LOCAL_STRIP_MODULE := true

include $(BUILD_SHARED_LIBRARY)
