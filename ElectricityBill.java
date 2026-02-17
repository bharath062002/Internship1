package com.example;
import java.util.Scanner;
import java.util.Scanner;

public class ElectricityBill {

    public static double calculateBill(double units) {

        double rate1 = 5;
        double rate2 = 7;
        double rate3 = 10;

        double bill = (units <= 100)
                ? units * rate1
                : (units <= 200)
                ? (100 * rate1) + (units - 100) * rate2
                : (100 * rate1) + (100 * rate2) + (units - 200) * rate3;

        return bill;
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter units consumed: ");
        double units = sc.nextDouble();

        double totalBill = calculateBill(units);

        System.out.println("Electricity Bill = Rs. " + totalBill);
    }
}