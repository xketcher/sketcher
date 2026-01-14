package com.my.service;

import static spark.Spark.*;
import javax.servlet.*;
import javax.servlet.http.Part;
import java.io.*;
import java.nio.file.Files;
import java.util.UUID;

public class MainServer {

    private static final File OUT_DIR = new File("/tmp/out");

    public static void main(String[] args) {

        port(10000);
        OUT_DIR.mkdirs();

        // ===============================
        // POST /encrypt-apk
        // ===============================
        post("/encrypt-apk", (req, res) -> {

            req.attribute(
                "org.eclipse.jetty.multipartConfig",
                new MultipartConfigElement("/tmp")
            );

            Part part = req.raw().getPart("apk");
            String id = UUID.randomUUID().toString();

            File inApk = new File("/tmp/" + id + "_in.apk");
            File outApk = new File(OUT_DIR, id + ".apk");

            try (InputStream is = part.getInputStream();
                 FileOutputStream fos = new FileOutputStream(inApk)) {
                is.transferTo(fos);
            }

            ApkBuilder b = new ApkBuilder();
            b.setPath(inApk.getAbsolutePath());
            b.move();

            // stub dex from container
            b.addDex(new File("resources/classes.dex"));

            String xml = b.getAndroidManifest();
            ManifestExtractor e = new ManifestExtractor();
            e.setXml(xml);

            b.addAsset(e.getLaunchActivityName(), "name.txt");

            b.setAndroidManifest(
                xml.replace(
                    e.getApplicationClassName(),
                    "my.StubApp"
                )
            );

            b.build(outApk.getAbsolutePath());

            String base = req.scheme() + "://" + req.host();

            res.type("application/json");
            return "{"
                + "\"status\":\"success\","
                + "\"data\":{"
                + "\"download_url\":\"" + base
                + "/download/" + id + ".apk\""
                + "}}";
        });

        // ===============================
        // GET /download/:file
        // ===============================
        get("/download/:file", (req, res) -> {

            File apk = new File(OUT_DIR, req.params(":file"));
            if (!apk.exists()) {
                res.status(404);
                return "Not found";
            }

            res.type("application/vnd.android.package-archive");
            res.header("Content-Disposition",
                    "attachment; filename=\"" + apk.getName() + "\"");

            Files.copy(apk.toPath(), res.raw().getOutputStream());
            return res.raw();
        });
    }
              }
