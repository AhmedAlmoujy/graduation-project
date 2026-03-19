export interface TrafficRecord {
  _id: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: number;
  timestamp: string;
  label: string | number;
}
