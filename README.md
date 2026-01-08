# AWS Billing Alarm

**IMPORTANT: AWS requires that the email to be notified must opt-in to receiving alerts. After deploying this stack, don't forget to check the notification email and confirm the subscription!**

This project configures a simple estimated charges billing alarm for an AWS account. Run this for any new account to create a basic guardrail against surprise bills.

## Prerequisites

Must first manually enable billing alerts in the AWS console. This is a one-time setup.

  - Go to the AWS Billing Dashboard.
  - In the left navigation pane, select Billing Preferences.
  - Check the box for Receive Cloudwatch Billing Alerts and save the settings.

Please note that AWS changes the console UI from time to time, so the above instructions may vary slightly.

You may also need to allow access to Billing for IAM users in the account settings, unless you are using the root account to run this script (which you shouldn't!)

## AWS Organizations and Linked Accounts

For accounts that are part of an AWS Organization, you can create a billing alarm stack in the organization management account to monitor the estimated charges of a member account. In fact, if the member account is not configured to allow billing alerts, and doesn't have root credentials, you will not be able to fulfill the prerequisites above.

To create a stack in the management account to monitor a member account, run this script against the management account and specify the Account ID of the member account in the environment variable `BILLING_ALARM_LINKED_ACCOUNT_ID`.

## Environment Variables

Expects the following environment variables:

- `BILLING_ALARM_THRESHOLD` - the estimated charges threshold that will trigger the alarm
- `BILLING_ALARM_EMAIL` - the email address to send the alarm to
- `BILLING_ALARM_LINKED_ACCOUNT_ID` - the account ID for the account that you want to make a billing alert for (AWS Organization member accounts only)

Can be included in a `.env` file in the root of the project.

## What it does

- Creates an SNS billing topic
- adds an email subscription to the topic
- creates a billing alarm that triggers when estimated charges exceed the input value
- adds the necessary permission to CloudWatch to publish to the SNS topic