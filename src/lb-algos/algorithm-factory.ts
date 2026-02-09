import { ILbAlgorithm } from "./lb-algo.interface";
import { RoundRobin } from "./rr";
import { WeightedRoundRobin } from "./wrr";

export function createLbAlgorithm(
  algoName: string,
  healthyServers: any,
): ILbAlgorithm {
  switch (algoName) {
    case "rr":
      console.log("[LB] Using Round Robin algorithm");
      return new RoundRobin(healthyServers);

    case "r":
      // return new RandomAlgorithm();
      throw new Error("Random not implemented yet");

    case "wrr":
      console.log("[LB] Using Weighted Round Robin algorithm");
      return new WeightedRoundRobin(healthyServers);

    default:
      console.warn(
        `[LB] Unknown algorithm '${algoName}', falling back to Round Robin`,
      );
      return new RoundRobin(healthyServers);
  }
}
