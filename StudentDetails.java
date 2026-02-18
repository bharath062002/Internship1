package com.example;
import java.util.Scanner;

public class StudentDetails {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        String[] names = new String[5];
        int[] marks = new int[5];
        for (int i = 0; i < 5; i++) {
            System.out.print("Enter student name: ");
            names[i] = sc.nextLine();

            System.out.print("Enter marks: ");
            marks[i] = sc.nextInt();
            sc.nextLine();
        }

        System.out.println("\nName\tMarks\tGrade");

        for (int i = 0; i < 5; i++) {

            String grade;

            if (marks[i] >= 80)
                grade = "Distinction";
            else if (marks[i] >= 60)
                grade = "First Class";
            else if (marks[i] >= 35)
                grade = "Second Class";
            else
                grade = "Fail";

            System.out.println(names[i] + "\t" + marks[i] + "\t" + grade);
        }

        sc.close();
    }
}
