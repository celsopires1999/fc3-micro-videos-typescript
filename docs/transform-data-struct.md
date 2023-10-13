Código para formatar a saída de erros para o cliente, usando reduce, concat e lodash(union)

```typescript
it("should test how the command work", () => {
  expect.assertions(0);
  const value = [
    "another error",
    {
      field1: ["field1 is required", "error 2"],
    },
    {
      field1: ["field1 is required", "error 2"],
    },
    {
      field2: ["field2 is required"],
    },
  ];

  const result1 = value.reduce(
    (acc, error) =>
      acc.concat(typeof error === "string" ? [[error]] : Object.values(error)),
    [],
  );

  console.log(result1);

  const result2 = union(
    ...value.reduce(
      (acc, error) =>
        acc.concat(
          typeof error === "string" ? [[error]] : Object.values(error),
        ),
      [],
    ),
  );

  console.log(result2);
});
```
