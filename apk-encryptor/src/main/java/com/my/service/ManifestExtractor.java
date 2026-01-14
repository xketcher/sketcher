package com.my.service;

import java.util.regex.*;

public class ManifestExtractor {

    private String xml;
    private String packageName;

    public void setXml(String xml) {
        this.xml = xml;
        Matcher m = Pattern.compile(
                "package\\s*=\\s*\"([^\"]+)\"").matcher(xml);
        if (m.find()) packageName = m.group(1);
    }

    public String getApplicationClassName() {
        Matcher m = Pattern.compile(
                "<application[^>]*android:name\\s*=\\s*\"([^\"]+)\"",
                Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        ).matcher(xml);
        return m.find() ? m.group(1) : null;
    }

    public String getLaunchActivityName() {

        Matcher m = Pattern.compile(
                "<activity[^>]*android:name\\s*=\\s*\"([^\"]+)\"[^>]*>(.*?)</activity>",
                Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        ).matcher(xml);

        while (m.find()) {
            String body = m.group(2);
            if (body.contains("android.intent.action.MAIN")
             && body.contains("android.intent.category.LAUNCHER")) {

                String name = m.group(1);
                return name.startsWith(".")
                        ? packageName + name
                        : name;
            }
        }
        return null;
    }
}
