import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION ?? "ap-northeast-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? "";

export interface ReportRecord {
  pk: string;
  sk: string;
  title: string;
  url: string;
  authors: string;
  year: string;
  venue: string;
  summary: string;
  report_path: string;
  report_type: string;
  created_at: string;
  updated_at: string;
}

export async function putReport(record: ReportRecord): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: record,
    }),
  );
}

export async function queryReportsByDomain(
  domain: string,
): Promise<ReportRecord[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `DOMAIN#${domain}`,
      },
      ScanIndexForward: false,
    }),
  );

  return (result.Items ?? []) as ReportRecord[];
}

export async function queryLatestReports(
  reportType: string,
  limit: number = 20,
): Promise<ReportRecord[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "reports-by-date",
      KeyConditionExpression: "report_type = :rt",
      ExpressionAttributeValues: {
        ":rt": reportType,
      },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );

  return (result.Items ?? []) as ReportRecord[];
}
