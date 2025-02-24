
interface AST {
  type: "root";
  values: Array<ASTComment | ASTVariable>
}

type ASTNode = ASTComment | ASTLiteral | ASTVariable;

interface ASTComment {
  type: "comment";
  line: number;
  hidden?: boolean;
  raws: {
    left: string;
    right: string;
  }
  value: string;
}

interface ASTVariable {
  type: "variable";
  line: number;
  hidden?: boolean;
  key: {
    left: string;
    right: string;
    value: string;
  }
  opt: { 
    left: string, 
    right: string,
    value: string; // = *= += -=
  },
  values: ASTLiteral[]
}

interface ASTLiteral {
  type: "literal";
  line: number;
  hidden?: boolean;
  raws: {
    left: string;
    right: string;
  }
  value: string;
}