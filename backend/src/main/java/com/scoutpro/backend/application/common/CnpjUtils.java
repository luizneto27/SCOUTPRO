package com.scoutpro.backend.application.common;

public final class CnpjUtils {

    private CnpjUtils() {
    }

    public static String normalize(String value) {
        if (value == null) {
            return null;
        }
        return value.replaceAll("\\D", "");
    }

    public static String format(String value) {
        String digits = normalize(value);
        if (digits == null || digits.length() != 14) {
            return value;
        }
        return digits.substring(0, 2) + "." + digits.substring(2, 5) + "." + digits.substring(5, 8)
                + "/" + digits.substring(8, 12) + "-" + digits.substring(12, 14);
    }
}
