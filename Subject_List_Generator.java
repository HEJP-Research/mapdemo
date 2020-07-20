/*
 * @author Ruth Rosenblum, Chami Lamelas, Eitan Joseph
 * @since  1.0.0
 * @link   https://github.com/EitanJoseph/SCARES-Mini-Tool
 */
import java.util.Scanner;
import java.io.File;
import java.io.FileNotFoundException;

public class Subject_List_Generator{
    public static void main(String[] args) throws FileNotFoundException{
        File f = new File("./SubjectsLines.txt");
        Scanner sc = new Scanner(f);
        System.out.println(printResult(sc));
    }

    public static String printResult(Scanner sc){
        StringBuilder str = new StringBuilder("var longNames = [\n");
        while (sc.hasNext()){
            String next = sc.next();
            if (next.equals("||")){
                continue;
            }
            str.append("\t\"" + next + "\",\n");
        }
        str.delete(str.length() - 2, str.length() - 1);
        return str.append("]").toString();
    }
}