import { BackendServerDetails } from "../backend-server-details";

export interface ILbAlgorithm {
    nextServer(): BackendServerDetails;
}