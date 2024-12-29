import { assertEquals } from "@std/assert";
import { computeRebalanceTransfers } from "./main.ts";

Deno.test(function addTest() {
  // 1
  let accounts = [
    { name: "Account 1", currentBalance: 1000, targetPercentage: 1 },
    { name: "Account 2", currentBalance: 500, targetPercentage: 59 },
    { name: "Account 3", currentBalance: 2000, targetPercentage: 15 },
    { name: "Account 4", currentBalance: 500, targetPercentage: 25 },
  ];
  let result = computeRebalanceTransfers(accounts);
  assertEquals(result, [
    {
      amount: 960,
      from: "Account 1",
      to: "Account 2",
    },
    {
      amount: 900,
      from: "Account 3",
      to: "Account 2",
    },
    {
      amount: 500,
      from: "Account 3",
      to: "Account 4",
    },
  ]);

  // 2
  accounts = [
    { name: "Account 1", currentBalance: 1000, targetPercentage: 25 },
    { name: "Account 2", currentBalance: 500, targetPercentage: 25 },
    { name: "Account 3", currentBalance: 2000, targetPercentage: 35 },
    { name: "Account 4", currentBalance: 500, targetPercentage: 15 },
  ];
  result = computeRebalanceTransfers(accounts);
  assertEquals(result, [
    {
      amount: 500,
      from: "Account 3",
      to: "Account 2",
    },
    {
      amount: 100,
      from: "Account 3",
      to: "Account 4",
    },
  ]);

  // 3
  accounts = [
    { name: "Account A", currentBalance: 555, targetPercentage: 20 },
    { name: "Account B", currentBalance: 1000, targetPercentage: 35 },
    { name: "Account C", currentBalance: 2400, targetPercentage: 10 },
    { name: "Account D", currentBalance: 1500, targetPercentage: 35 },
  ];
  result = computeRebalanceTransfers(accounts);
  assertEquals(result, [
    {
      amount: 536,
      from: "Account C",
      to: "Account A",
    },
    {
      amount: 909.25,
      from: "Account C",
      to: "Account B",
    },
    {
      amount: 409.25,
      from: "Account C",
      to: "Account D",
    },
  ]);
});
