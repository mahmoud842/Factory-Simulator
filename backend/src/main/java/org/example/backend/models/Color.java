package org.example.backend.models;

import java.util.Random;

public enum Color {
    BLUE {
        @Override
        public String getDescription() {
            return "#0000FF";
        }
    },
    RED {
        @Override
        public String getDescription() {
            return "#FF0000";
        }
    },
    YELLOW {
        @Override
        public String getDescription() {
            return "#FFFF00";
        }
    },
    GREEN {
        @Override
        public String getDescription() {
            return "#00FF00";
        }
    },
    BROWN {
        @Override
        public String getDescription() {
            return "#8B4513";
        }
    },
    PINK {
        @Override
        public String getDescription() {
            return "#FF69B4";
        }
    },
    PURPLE {
        @Override
        public String getDescription() {
            return "#800080";
        }
    };

    public abstract String getDescription();

    public static Color getRandomColor() {
        Random random = new Random();
        int index = random.nextInt(Color.values().length);
        return Color.values()[index];
    }
}