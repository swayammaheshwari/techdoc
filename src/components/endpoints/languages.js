// import js from '@/assets/icons/js.svg';
import js from '../../../public/assets/icons/js.svg';
import java from '../../../public/assets/icons/java.svg';
import shell from '../../../public/assets/icons/terminal.svg';
import node from '../../../public/assets/icons/node.svg';
import php from '../../../public/assets/icons/php.svg';
import csharp from '../../../public/assets/icons/csharp.svg';
import python from '../../../public/assets/icons/python.svg';
import ruby from '../../../public/assets/icons/ruby.svg';
import swift from '../../../public/assets/icons/swift.svg';
import go from '../../../public/assets/icons/go.svg';
import ocaml from '../../../public/assets/icons/ocaml.svg';
import objectivec from '../../../public/assets/icons/objectivec.svg';
import r from '../../../public/assets/icons/r.svg';
import clojure from '../../../public/assets/icons/clojure.svg';
import c from '../../../public/assets/icons/c.svg';
import http from '../../../public/assets/icons/http.svg';

const primaryLanguages = ['shell', 'axiosNode', 'php', 'python', 'node'];
const secondaryLanguages = ['c', 'csharp', 'clojure', 'go', 'http', 'java', 'javascript', 'objc', 'ocaml', 'r', 'ruby', 'swift'];
const languages = {
  node: {
    name: 'Node',
    title: 'node-image',
    mode: 'javascript',
    imagePath: node,
  },
  c: {
    name: 'C',
    mode: 'c_cpp',
    imagePath: c,
  },
  python: {
    name: 'Python',
    title: 'Python-image',
    mode: 'python',
    imagePath: python,
  },
  javascript: {
    name: 'Javascript',
    mode: 'javascript',
    imagePath: js,
  },
  php: {
    name: 'PHP',
    title: 'PHP-image',
    mode: 'php',
    imagePath: php,
  },
  java: {
    name: 'JAVA',
    mode: 'java',
    imagePath: java,
  },
  shell: {
    name: 'Shell',
    title: 'Shell-image',
    mode: 'sh',
    imagePath: shell,
  },
  csharp: {
    name: 'C#',
    mode: 'csharp',
    imagePath: csharp,
  },
  r: {
    name: 'R',
    mode: 'r',
    imagePath: r,
  },
  ruby: {
    name: 'Ruby',
    mode: 'ruby',
    imagePath: ruby,
  },
  swift: {
    name: 'Swift',
    mode: 'swift',
    imagePath: swift,
  },
  http: {
    name: 'HTTP',
    mode: 'sh',
    imagePath: http,
  },
  clojure: {
    name: 'Clojure',
    mode: 'clojure',
    imagePath: clojure,
  },
  go: {
    name: 'go',
    mode: 'golang',
    imagePath: go,
  },
  objc: {
    name: 'Objective C',
    mode: 'objectivec',
    imagePath: objectivec,
  },
  ocaml: {
    name: 'ocaml',
    mode: 'ocaml',
    imagePath: ocaml,
  },
  axiosNode: {
    name: 'Axios',
    title: 'Axios-image',
    mode: 'javascript',
    imagePath: node,
  },
};

export { languages, primaryLanguages, secondaryLanguages };
