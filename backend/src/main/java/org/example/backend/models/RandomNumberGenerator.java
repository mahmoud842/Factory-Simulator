package org.example.backend.models;

import java.util.Random;

public class RandomNumberGenerator {

    // can be used to generate input Or machine processing time
    Random random;
    RandomNumberGenerator() {
        this.random = new Random();
    }

    int GetRandomNumber(int min, int max) {
        return random.nextInt((max - min) + 1) + min;
    }
}
