declare global {
    type Either<X, Y> = Either_left<X, Y> | Either_right<X, Y>;
  
    interface Either_left<X, Y> {
      readonly kind: 'Either_left';
      readonly value: X;
    }
  
    interface Either_right<X, Y> {
      readonly kind: 'Either_right';
      readonly value: Y;
    }
  
    function bitLen(n: number): number;
  }
  
  // This export is necessary to make this a module
  export {};
