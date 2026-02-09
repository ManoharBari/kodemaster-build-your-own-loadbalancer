import { ILbAlgorithm } from "./lb-algo.interface";
import { WeightedRoundRobin } from "./wrr";

export function createLbAlgorithm(
  algoName: string,
  healthyServers: any,
): ILbAlgorithm {
  switch (algoName) {
    case "rr":
      // return new RoundRobinAlgorithm();
      throw new Error("Round Robin not implemented yet");

    case "r":
      // return new RandomAlgorithm();
      throw new Error("Random not implemented yet");

    case "wrr":
      //   return new WeightedRoundRobin(servers);
      throw new Error("WeightedRoundRobin not implemented yet");

    default:
      throw new Error("Unknown load balancing algorithm");
  }
}
