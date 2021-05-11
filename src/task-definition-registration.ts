import * as fs from "fs";
import { parse } from "yaml";

import ECS, {
  TaskDefinition,
  RegisterTaskDefinitionRequest,
} from "aws-sdk/clients/ecs";

export interface TaskRegistrationInput {
  family?: string;
  secrets?: object;
  template?: string;
  containerImages?: object;
  environmentVars?: object;
}

export interface TaskDefinitionContainerImageOverride {
  image: string;
  names: Array<string>;
}

function getClient(): ECS {
  return new ECS({
    customUserAgent: "icalia-actions/aws-action",
    region: process.env.AWS_DEFAULT_REGION,
  });
}

function readTaskDefinitionTemplate(
  input: TaskRegistrationInput
): RegisterTaskDefinitionRequest | undefined {
  const { template } = input;
  if (!template || !fs.existsSync(template)) return;

  const templateContents = fs.readFileSync(template, "utf8");
  return parse(templateContents);
}

function overrideContainerImages(
  definition: RegisterTaskDefinitionRequest,
  containerImages: object
): void {
  const { containerDefinitions } = definition;
  if (!containerImages || !containerDefinitions) return;

  for (const [name, image] of Object.entries(containerImages)) {
    const definition = containerDefinitions.find((def) => def.name == name);
    if (definition) definition.image = image;
  }
}

function overrideEnvironmentVars(
  definition: RegisterTaskDefinitionRequest,
  environmentVars: object
): void {
  const { containerDefinitions } = definition;
  if (!environmentVars || !containerDefinitions) return;

  for (const [name, value] of Object.entries(environmentVars)) {
    containerDefinitions.forEach((definition) => {
      const { environment } = definition;
      if (!environment) return;

      let variableDefinition = environment.find((def) => def.name == name);
      if (variableDefinition) variableDefinition.value = value;
    });
  }
}

function overrideSecrets(
  definition: RegisterTaskDefinitionRequest,
  secrets: object
): void {
  const { containerDefinitions } = definition;
  if (!secrets || !containerDefinitions) return;

  for (const [name, value] of Object.entries(secrets)) {
    containerDefinitions.forEach((definition) => {
      const { secrets } = definition;
      if (!secrets) return;

      let variableDefinition = secrets.find((def) => def.name == name);
      if (variableDefinition) variableDefinition.valueFrom = value;
    });
  }
}

function processTaskDefinitionInput(
  input: TaskRegistrationInput
): RegisterTaskDefinitionRequest | undefined {
  const { family, containerImages, environmentVars, secrets } = input;

  let taskDefinition = readTaskDefinitionTemplate(input);
  if (!taskDefinition) return;

  if (family) taskDefinition.family = family;
  if (secrets) overrideSecrets(taskDefinition, secrets);
  if (containerImages) overrideContainerImages(taskDefinition, containerImages);
  if (environmentVars) overrideEnvironmentVars(taskDefinition, environmentVars);

  return taskDefinition;
}

export async function registerTaskDefinition(
  input: TaskRegistrationInput
): Promise<TaskDefinition> {
  const ecs = getClient();
  const taskDefinitionToRegister = processTaskDefinitionInput(input);
  if (!taskDefinitionToRegister)
    throw new Error("No Task Definition for given template");

  const { taskDefinition } = await ecs
    .registerTaskDefinition(taskDefinitionToRegister)
    .promise();

  if (!taskDefinition) throw new Error("Couldn't register task definition");

  return taskDefinition;
}
