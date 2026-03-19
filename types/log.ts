export interface LogEntry {
  _id: string;
  report_id?: string;
  decoded_data: string;
  received_at: string;
  analyzed: boolean;
  source_ip: string;
  method: string;
  url: string;
  user_agent: string;
  host: string;
  headers: {
    pragma?: string;
    "cache-control"?: string;
    accept?: string;
    "accept-encoding"?: string;
    "accept-charset"?: string;
    "accept-language"?: string;
    cookie?: string;
    "content-type"?: string;
    connection?: string;
    "content-length"?: string;
    content?: string;
  };
}
