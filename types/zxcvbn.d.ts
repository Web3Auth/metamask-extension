declare module 'zxcvbn' {
  type ZxcvbnResult = {
    score: number;
    feedback: {
      warning: string;
      suggestions: string[];
    };
  };

  function zxcvbn(password: string): ZxcvbnResult;
  export = zxcvbn;
}
