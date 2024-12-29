package org.example.backend.models;

import java.util.Random;

public enum Color {
    BLUE {
        @Override
        public String getDescription() {
            return "blue";
        }
    },
    RED {
        @Override
        public String getDescription() {
            return "red";
        }
    },
    YELLOW {
        @Override
        public String getDescription() {
            return "yellow";
        }
    },
    GREEN {
        @Override
        public String getDescription() {
            return "green";
        }
    },
    BROWN {
        @Override
        public String getDescription() {
            return "brown";
        }
    },
    PINK {
        @Override
        public String getDescription() {
            return "pink";
        }
    },
    PURPLE {
        @Override
        public String getDescription() {
            return "purple";
        }
    };

    public abstract String getDescription();

    public static Color getRandomColor() {
        Random random = new Random();
        int index = random.nextInt(Color.values().length);
        return Color.values()[index];
    }
}