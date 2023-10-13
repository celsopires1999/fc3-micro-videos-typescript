Getter in a function

```typescript
describe("Getter in a function", () => {
  it("should return a method", () => {
    const h = helper("Janete");
    expect(h.message).toBe("Hello Janete! Your manager is Fernanda.");
  });
});

function helper(name: string) {
  const manager = "Fernanda";
  return {
    get message() {
      return `Hello ${name}! Your manager is ${manager}.`;
    },
  };
}
```
