package com.my.service;

import java.io.*;
import java.util.zip.*;
import com.apk.axml.aXMLDecoder;
import com.apk.axml.aXMLEncoder;

public class ApkBuilder {

    private File tempApk;

    // ===============================
    // 1) setPath
    // ===============================
    public void setPath(String inputApkPath) throws Exception {
        tempApk = File.createTempFile("base", ".apk");
        copy(new File(inputApkPath), tempApk);
    }

    // ===============================
    // 2) move dex → assets/
    // ===============================
    public void move() throws Exception {

        File out = File.createTempFile("move", ".apk");

        ZipInputStream zis = new ZipInputStream(new FileInputStream(tempApk));
        ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(out));

        ZipEntry entry;
        byte[] buf = new byte[4096];

        while ((entry = zis.getNextEntry()) != null) {

            String name = entry.getName();

            if (name.endsWith(".dex")) {
                // 🔥 FINAL REQUIREMENT
                zos.putNextEntry(new ZipEntry("assets/" + name));
            } else {
                zos.putNextEntry(new ZipEntry(name));
            }

            int len;
            while ((len = zis.read(buf)) != -1) {
                zos.write(buf, 0, len);
            }
            zos.closeEntry();
        }

        zis.close();
        zos.close();
        tempApk = out;
    }

    // ===============================
    // 3) addDex (root classes.dex)
    // ===============================
    public void addDex(File dexFile) throws Exception {

        File out = File.createTempFile("adddex", ".apk");

        ZipInputStream zis = new ZipInputStream(new FileInputStream(tempApk));
        ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(out));

        byte[] buf = new byte[4096];
        ZipEntry entry;

        while ((entry = zis.getNextEntry()) != null) {
            zos.putNextEntry(new ZipEntry(entry.getName()));
            int len;
            while ((len = zis.read(buf)) != -1) {
                zos.write(buf, 0, len);
            }
            zos.closeEntry();
        }
        zis.close();

        // add stub dex
        InputStream is = new FileInputStream(dexFile);
        zos.putNextEntry(new ZipEntry("classes.dex"));

        int len;
        while ((len = is.read(buf)) != -1) {
            zos.write(buf, 0, len);
        }

        zos.closeEntry();
        is.close();
        zos.close();

        tempApk = out;
    }

    // ===============================
    // 4) addAsset (assets/name.txt)
    // ===============================
    public void addAsset(String content, String fileName) throws Exception {

        File out = File.createTempFile("asset", ".apk");

        ZipInputStream zis = new ZipInputStream(new FileInputStream(tempApk));
        ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(out));

        byte[] buf = new byte[4096];
        ZipEntry entry;

        while ((entry = zis.getNextEntry()) != null) {
            zos.putNextEntry(new ZipEntry(entry.getName()));
            int len;
            while ((len = zis.read(buf)) != -1) {
                zos.write(buf, 0, len);
            }
            zos.closeEntry();
        }
        zis.close();

        zos.putNextEntry(new ZipEntry("assets/" + fileName));
        zos.write(content.getBytes("UTF-8"));
        zos.closeEntry();

        zos.close();
        tempApk = out;
    }

    // ===============================
    // 5) getAndroidManifest (AXML → XML)
    // ===============================
    public String getAndroidManifest() throws Exception {

        ZipFile zip = new ZipFile(tempApk);
        InputStream is = zip.getInputStream(
                zip.getEntry("AndroidManifest.xml"));

        String xml = new aXMLDecoder().decode(is).trim();

        is.close();
        zip.close();
        return xml;
    }

    // ===============================
    // 6) setAndroidManifest (XML → AXML)
    // ===============================
    public void setAndroidManifest(String xml) throws Exception {

        File out = File.createTempFile("manifest", ".apk");

        ZipInputStream zis = new ZipInputStream(new FileInputStream(tempApk));
        ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(out));

        byte[] newAxml = new aXMLEncoder()
                .encodeString(null, xml.trim());

        byte[] buf = new byte[4096];
        ZipEntry entry;

        while ((entry = zis.getNextEntry()) != null) {
            if (!entry.getName().equals("AndroidManifest.xml")) {
                zos.putNextEntry(new ZipEntry(entry.getName()));
                int len;
                while ((len = zis.read(buf)) != -1) {
                    zos.write(buf, 0, len);
                }
                zos.closeEntry();
            }
        }
        zis.close();

        zos.putNextEntry(new ZipEntry("AndroidManifest.xml"));
        zos.write(newAxml);
        zos.closeEntry();

        zos.close();
        tempApk = out;
    }

    // ===============================
    // 7) build
    // ===============================
    public void build(String outPath) throws Exception {
        copy(tempApk, new File(outPath));
    }

    private void copy(File src, File dst) throws Exception {
        try (InputStream is = new FileInputStream(src);
             OutputStream os = new FileOutputStream(dst)) {
            byte[] buf = new byte[4096];
            int len;
            while ((len = is.read(buf)) != -1) {
                os.write(buf, 0, len);
            }
        }
    }
                   }
