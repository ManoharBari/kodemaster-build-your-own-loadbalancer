import { ILbAlgorithm } from "./lb-algo.interface";
import { RoundRobin } from "./rr";
import { WeightedRoundRobin } from "./wrr";

export function createLbAlgorithm(
  algoName: string,
  healthyServers: any,
): ILbAlgorithm {
  switch (algoName) {
    case "rr":
      return new RoundRobin(healthyServers);
      throw new Error("Round Robin not implemented yet");

    case "r":
      // return new RandomAlgorithm();
      throw new Error("Random not implemented yet");

    case "wrr":
      return new WeightedRoundRobin(healthyServers);
      throw new Error("WeightedRoundRobin not implemented yet");

    default:
      throw new Error("Unknown load balancing algorithm");
  }
}
