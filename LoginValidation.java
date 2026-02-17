package com.example;
import java.util.Scanner;

public class LoginValidation {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Username: ");
        String username = sc.nextLine();

        System.out.print("Enter Password: ");
        String password = sc.nextLine();

        if (username.equals("admin") && password.equals("1234")) {
            System.out.println("Login Successful!");
        } else {
            System.out.println("Invalid Username or Password.");
        }

    }
}
