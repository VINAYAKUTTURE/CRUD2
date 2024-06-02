const { PutCommand, GetCommand, UpdateCommand, DeleteCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const operation = event.operation;
    const tableName = event.tableName || null;
    let payload = event.payload || {};

    if (!tableName) {
      throw new Error('TableName is required');
    }

    let result;

    switch (operation) {
      case 'create':
        if (!payload.ElementName) {
          throw new Error('ElementName is required for create operation');
        }
        payload = {
          ...payload,
          EmployeeId: payload.ElementName,
        };
        const putCommand = new PutCommand({
          TableName: tableName,
          Item: payload,
        });
        result = await docClient.send(putCommand);
        break;

      case 'read':
        if (!payload.EmployeeId) {
          throw new Error('EmployeeId is required for read operation');
        }
        const getCommand = new GetCommand({
          TableName: tableName,
          Key: { EmployeeId: payload.EmployeeId },
        });
        result = await docClient.send(getCommand);
        break;

      case 'update':
        if (!payload.Key || !payload.UpdateExpression || !payload.ExpressionAttributeValues) {
          throw new Error('Key, UpdateExpression, and ExpressionAttributeValues are required for update operation');
        }
        const updateCommand = new UpdateCommand({
          TableName: tableName,
          Key: payload.Key,
          UpdateExpression: payload.UpdateExpression,
          ExpressionAttributeNames: payload.ExpressionAttributeNames,
          ExpressionAttributeValues: payload.ExpressionAttributeValues,
        });
        result = await docClient.send(updateCommand);
        break;

      case 'delete':
        if (!payload.EmployeeId) {
          throw new Error('EmployeeId is required for delete operation');
        }
        const deleteCommand = new DeleteCommand({
          TableName: tableName,
          Key: { EmployeeId: payload.EmployeeId },
        });
        result = await docClient.send(deleteCommand);
        break;

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};
