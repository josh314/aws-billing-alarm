#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BillingAlarmStack } from '../lib/billing-alarm-stack';

import 'dotenv/config';

if( !process.env.BILLING_ALARM_EMAIL || !process.env.BILLING_ALARM_THRESHOLD ) {
  console.error('Please provide BILLING_ALARM_EMAIL and BILLING_ALARM_THRESHOLD in .env file');
  process.exit(1);
}

const stackName = process.env.BILLING_ALARM_LINKED_ACCOUNT_ID
  ? `BillingAlarmStack-${process.env.BILLING_ALARM_LINKED_ACCOUNT_ID}`
  : 'BillingAlarmStack';

const app = new cdk.App();
new BillingAlarmStack(app, 'BillingAlarmStack', {
  stackName,
  email: process.env.BILLING_ALARM_EMAIL!,
  threshold: Number(process.env.BILLING_ALARM_THRESHOLD!),
  linkedAccountId: process.env.BILLING_ALARM_LINKED_ACCOUNT_ID, // Optional, for cross-account billing such as with AWS Organizations
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }, // you may wish to modify these values for your usage.
});