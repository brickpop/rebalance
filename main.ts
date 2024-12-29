import { ACCOUNTS } from "./input.ts";

interface AccountState {
  name: string;
  currentBalance: number;
  targetPercentage: number;
  targetBalance?: number;
}
interface Transfer {
  from: string;
  to: string;
  amount: number;
}

function main() {
  try {
    const transfers = computeRebalanceTransfers(ACCOUNTS);
    for (const transfer of transfers) {
      console.log(
        `- Transfer ${transfer.amount} from ${transfer.from} to ${transfer.to}`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error("An error occurred:", error);
  }
}

export function computeRebalanceTransfers(
  initialAccounts: AccountState[]
): Transfer[] {
  let result: Transfer[] = [];
  const accounts: AccountState[] = JSON.parse(JSON.stringify(initialAccounts));
  const totalPercentage = accounts.reduce(
    (acc, account) => acc + account.targetPercentage,
    0
  );
  if (totalPercentage !== 100) {
    throw new Error("The total percentage should be 100: " + totalPercentage);
  }
  const totalBalance = accounts.reduce(
    (acc, account) => acc + account.currentBalance,
    0
  );
  for (let i = 0; i < accounts.length; i++) {
    accounts[i].targetBalance =
      (accounts[i].targetPercentage * totalBalance) / 100;
  }

  console.table(accounts);
  console.log("Total balance:", totalBalance);

  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].targetBalance === accounts[i].currentBalance) {
      continue;
    } else if (accounts[i].currentBalance < accounts[i].targetBalance!) {
      // Less balance than it should
      const amount = accounts[i].targetBalance! - accounts[i].currentBalance;
      const newTransfers = consumeFromAccounts(accounts, i + 1, amount);
      accounts[i].currentBalance += amount;
      result = result.concat(newTransfers);
    } else {
      // More balance than it should
      const amount = accounts[i].currentBalance - accounts[i].targetBalance!;
      const newTransfers = creditToAccounts(accounts, i + 1, amount);
      accounts[i].currentBalance -= amount;
      result = result.concat(newTransfers);
    }
  }

  return result;
}

function consumeFromAccounts(
  accounts: AccountState[],
  fromIdx: number,
  amount: number
): Transfer[] {
  let remainingTransferAmount = amount;
  const result: Transfer[] = [];

  for (
    let i = fromIdx;
    i < accounts.length && remainingTransferAmount !== 0;
    i++
  ) {
    if (accounts[i].currentBalance > accounts[i].targetBalance!) {
      // The account has more than it should
      const excessBalance =
        accounts[i].currentBalance - accounts[i].targetBalance!;

      // Is it enough?
      if (excessBalance < remainingTransferAmount) {
        // Consume everything and continue
        result.push({
          amount: excessBalance,
          from: accounts[i].name,
          to: accounts[fromIdx - 1].name,
        });

        accounts[i].currentBalance -= excessBalance;
        remainingTransferAmount -= excessBalance;
      } else {
        // Consume only what's needed and exit
        result.push({
          amount: remainingTransferAmount,
          from: accounts[i].name,
          to: accounts[fromIdx - 1].name,
        });

        accounts[i].currentBalance -= remainingTransferAmount;
        return result;
      }
    }
  }

  if (remainingTransferAmount > 0.001) {
    console.log(remainingTransferAmount);
    throw new Error(
      "Cannot consume enough balance from the remaining accounts"
    );
  }
  return result;
}

function creditToAccounts(
  accounts: AccountState[],
  fromIdx: number,
  amount: number
): Transfer[] {
  let remainingTransferAmount = amount;
  const result: Transfer[] = [];

  for (
    let i = fromIdx;
    i < accounts.length && remainingTransferAmount !== 0;
    i++
  ) {
    if (accounts[i].currentBalance < accounts[i].targetBalance!) {
      // The account has less than it should
      const neededBalance =
        accounts[i].targetBalance! - accounts[i].currentBalance;

      // Is it enough?
      if (neededBalance < remainingTransferAmount) {
        // Consume everything and continue
        result.push({
          amount: neededBalance,
          from: accounts[fromIdx - 1].name,
          to: accounts[i].name,
        });

        accounts[i].currentBalance += neededBalance;
        remainingTransferAmount -= neededBalance;
      } else {
        // Consume only what's needed and exit
        result.push({
          amount: remainingTransferAmount,
          from: accounts[fromIdx - 1].name,
          to: accounts[i].name,
        });

        accounts[i].currentBalance += remainingTransferAmount;
        return result;
      }
    }
  }

  if (remainingTransferAmount > 0.001) {
    throw new Error(
      "Did not credit enough balance from the remaining accounts"
    );
  }
  return result;
}

if (import.meta.main) {
  main();
}
