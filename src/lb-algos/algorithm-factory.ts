import { ILbAlgorithm } from "./lb-algo.interface";

export function createLbAlgorithm(algoName: string): ILbAlgorithm {
  switch (algoName) {
    case "round-robin":
      // return new RoundRobinAlgorithm();
      throw new Error("Round Robin not implemented yet");

    case "random":
      // return new RandomAlgorithm();
      throw new Error("Random not implemented yet");

    default:
      throw new Error("Unknown load balancing algorithm");
  }
}
