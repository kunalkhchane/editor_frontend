// 'use client'

// import dynamic from 'next/dynamic';
// import { useState } from 'react';
// import axios from 'axios';

// const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// const languageOptions = {
//   python: 'Python',
//   cpp: 'C++',
//   javascript: 'JavaScript',
//   java: 'Java',
// };

// const defaultSnippets: Record<string, string> = {
//   python: `print("Hello from Python!")`,
//   cpp: `#include <iostream>
// using namespace std;
// int main() {
//     cout << "Hello from C++!" << endl;
//     return 0;
// }`,
//   javascript: `console.log("Hello from JavaScript!");`,
//   java: `public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello from Java!");
//     }
// }`,
// };

// export default function Home() {
//   const [language, setLanguage] = useState<keyof typeof languageOptions>('python');
//   const [code, setCode] = useState(defaultSnippets['python']);
//   const [output, setOutput] = useState('');
//   const [loading, setLoading] = useState(false);


//   const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selected = e.target.value as keyof typeof languageOptions;
//     setLanguage(selected);
//     setCode(defaultSnippets[selected]);
//   };

//   const handleRun = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:8000/api/run/', {
//         code,
//         language
//       });
//       console.log(res)
//       setOutput(res.data.output || res.data.error);
//     } catch (err) {
//       setOutput('Error executing code.');
//     }
//     setLoading(false);
//   };

//   return (
//     <div
//       style={{
//         padding: 20,
//         backgroundColor: "#0e1117",
//         color: "#fff",
//         minHeight: "100vh",
//       }}
//     >

//       <select
//         value={language}
//         onChange={handleLanguageChange}
//         style={{ marginBottom: 10 }}
//       >
//         {Object.entries(languageOptions).map(([key, label]) => (
//           <option key={key} value={key} style={{color:'black'}}>
//             {label}
//           </option>
//         ))}
//       </select>

//       <MonacoEditor
//         height="400px"
//         language={language === "cpp" ? "cpp" : language}
//         value={code}
//         theme="vs-dark"
//         onChange={(value) => setCode(value || "")}
//       />


//       <button onClick={handleRun} disabled={loading} style={{ marginTop: 10 }}>
//         {loading ? "Running..." : "Run Code"}
//       </button>

//       <pre
//         style={{
//           background: "#1e1e1e",
//           padding: "1rem",
//           borderRadius: "8px",
//           marginTop: "1rem",
//         }}
//       >
//         {output}
//       </pre>
//     </div>
//   );
// }










































'use client'

import dynamic from 'next/dynamic';
import { useState } from 'react';
import axios from 'axios';

// Dynamically import the Editor component to avoid invalid element type error
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => {
    console.log('Monaco module:', mod); // Debug module structure
    return mod.Editor || mod.default.Editor || mod.default;
  }).catch((err) => {
    console.error('Failed to load MonacoEditor:', err);
    return () => (
      <textarea
        style={{ width: '100%', height: '400px', background: '#1e1e1e', color: '#fff' }}
        defaultValue="Monaco Editor failed to load. Use this textarea instead."
      />
    );
  }),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
  }
);

const languageOptions = {
  python: 'Python',
  cpp: 'C++',
  javascript: 'JavaScript',
  java: 'Java',
};

const defaultSnippets = {
  python: `import sys
print("Enter your first name: ", end="")
first_name = sys.stdin.readline().strip()
print("Enter your last name: ", end="")
last_name = sys.stdin.readline().strip()
print(f"Hello, {first_name} {last_name}!")`,
  cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    string first_name, last_name;
    cout << "Enter your first name: ";
    getline(cin, first_name);
    cout << "Enter your last name: ";
    getline(cin, last_name);
    cout << "Hello, " << first_name << " " << last_name << "!" << endl;
    return 0;
}`,
  javascript: `const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question('Enter your first name: ', (first_name) => {
  rl.question('Enter your last name: ', (last_name) => {
    console.log(\`Hello, \${first_name} \${last_name}!\`);
    rl.close();
  });
});`,
  java: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your first name: ");
        String first_name = scanner.nextLine();
        System.out.print("Enter your last name: ");
        String last_name = scanner.nextLine();
        System.out.println("Hello, " + first_name + " " + last_name + "!");
        scanner.close();
    }
}`,
};

export default function Home() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultSnippets['python']);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLanguage(selected);
    setCode(defaultSnippets[selected]);
    setUserInput('');
    setOutput('');
  };

  const handleRun = async () => {
    setLoading(true);
    const payload = {
      code,
      language,
      stdin: userInput.trim(),
    };
    console.log('Sending payload:', payload);
    try {
      const res = await axios.post('http://localhost:8000/api/run/', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', res.data);
      setOutput(`Input:\n${userInput.trim() || 'None'}\n\nOutput:\n${res.data.output || ''}\n\nError:\n${res.data.error || ''}`);
    } catch (err) {
      console.error('Error:', err);
      setOutput(`Input:\n${userInput.trim() || 'None'}\n\nError executing code: ${err.response?.data?.error || err.message}`);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: '#0e1117',
        color: '#fff',
        minHeight: '100vh',
      }}
    >

      <select
        value={language}
        onChange={handleLanguageChange}
        style={{ marginBottom: 10, color: '#fff', backgroundColor: '#1e1e1e', padding: '5px' }}
      >
        {Object.entries(languageOptions).map(([key, label]) => (
          <option key={key} value={key} style={{ color: '#000' }}>
            {label}
          </option>
        ))}
      </select>

      <MonacoEditor
        height="400px"
        language={language === 'cpp' ? 'cpp' : language}
        value={code}
        theme="vs-dark"
        onChange={(value) => setCode(value || '')}
      />

      <textarea
        placeholder="Enter input for your code here (one line per input, e.g., 'Kunal\nkhachane' for two inputs)..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        rows={4}
        style={{
          width: '100%',
          marginTop: 10,
          background: '#1e1e1e',
          color: '#fff',
          padding: '10px',
          borderRadius: '8px',
        }}
      />

      <button
        onClick={handleRun}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: '10px 20px',
          background: loading ? '#555' : '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Running...' : 'Run Code'}
      </button>

      <pre
        style={{
          background: '#1e1e1e',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          whiteSpace: 'pre-wrap',
        }}
      >
        {output}
      </pre>
    </div>
  );
}
