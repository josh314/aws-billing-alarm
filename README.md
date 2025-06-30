# AWS Billing Alarm

**IMPORTANT: AWS requires that the email to be notified must opt-in to receiving alerts. After deploying this stack, don't forget to check the notification email and confirm the subscription!**

This project configures a simple estimated charges billing alarm for an AWS account. Run this for any new account to create a basic guardrail against surprise bills.

## Prerequisites

Must first manually enable billing alerts in the AWS console. This is a one-time setup.

  - Go to the AWS Billing Dashboard.
  - In the left navigation pane, select Billing Preferences.
  - Check the box for Receive Cloudwatch Billing Alerts and save the settings.

You may also need to allow access to Billing for IAM users in the account settings, unless you are using the root account to run this script (which you shouldn't!)

## Environment Variables

Expects the following environment variables:

- `BILLING_ALARM_THRESHOLD` - the estimated charges threshold that will trigger the alarm
- `BILLING_ALARM_EMAIL` - the email address to send the alarm to

Can be included in a `.env` file in the root of the project.

## What it does

- Creates an SNS billing topic
- adds an email subscription to the topic
- creates a billing alarm that triggers when estimated charges exceed the input value
- adds the necessary permission to CloudWatch to publish to the SNS topic