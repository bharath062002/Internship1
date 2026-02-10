package com.example;
import java.util.Scanner;

public class PositiveNegative {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int num;
        System.out.print("Enter a number: ");
        num = sc.nextInt();

        if (num > 2) {
            System.out.println("The number is Positive");
        } else if (num < 2) {
            System.out.println("The number is Negative");
        } else {
            System.out.println("The number is Zero");
        }
    }
}

