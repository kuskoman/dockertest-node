export interface PortEntry {
    containerPort: number;
    hostPort: number;
    type?: "tcp" | "udp";
}
