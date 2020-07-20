/*
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 */

import java.util.Scanner;
import java.io.File;
import java.io.FileNotFoundException;

public class Option_Generator{
    public static void main(String[] args) throws FileNotFoundException{
        File f = new File("./CareerAreas.txt");
        Scanner sc = new Scanner(f);
        System.out.println(printOptions(sc));
        System.out.println();
        System.out.println();
        sc = new Scanner(f);
        System.out.println(printList(sc));
    }

    public static String printOptions(Scanner sc){
        StringBuilder str = new StringBuilder();
        while (sc.hasNextLine()){
            String next = sc.nextLine();
            // next.replaceAll("\\s|,\\s", "-") incase needed
            str.append("<option value='" + next +"'>" + next + "</option>" + "\n");
        }
        return str.toString();
    }

    public static String printList(Scanner sc){
        StringBuilder str = new StringBuilder("var careerAreas = [\n");
        while (sc.hasNextLine()){
            String next = sc.nextLine();
            // next.replaceAll("\\s|,\\s", "-") incase needed
            str.append("\t\"" + next + "\",\n");
        }
        str.delete(str.length() - 2, str.length() - 1);
        return str.append("]").toString();
    }
}