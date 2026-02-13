import java.util.Scanner;

class Wallet {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        double balance = 10000;

        while (true) {

            System.out.println("\nBalance: ₹" + balance);
            System.out.println("1.UPI  2.Card  3.Cash  4.Exit");
            System.out.print("Choice: ");
            int choice = sc.nextInt();

            if (choice == 4) break;

            System.out.print("Amount: ");
            double amount = sc.nextDouble();

            if (amount <= balance) {
                balance -= amount;
                System.out.println("Payment Successful");
            } else {
                System.out.println("Insufficient Balance");
            }
        }

        sc.close();
        System.out.println("Thank You!");
    }
}
