export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudConfig {
  templateName: string;
  cloud: CloudProvider | undefined;
  region: string;
}

export const cloudRegions: Record<string, { code: string; name: string }[]> = {
  aws: [
    { code: "us-east-1", name: "US East (N. Virginia)" },
    { code: "us-east-2", name: "US East (Ohio)" },
    { code: "us-west-1", name: "US West (N. California)" },
    { code: "us-west-2", name: "US West (Oregon)" },
    { code: "ca-central-1", name: "Canada (Central)" },
    { code: "eu-west-1", name: "Europe (Ireland)" },
    { code: "eu-west-2", name: "Europe (London)" },
    { code: "eu-west-3", name: "Europe (Paris)" },
    { code: "eu-central-1", name: "Europe (Frankfurt)" },
    { code: "eu-north-1", name: "Europe (Stockholm)" },
    { code: "eu-south-1", name: "Europe (Milan)" },
    { code: "ap-south-1", name: "Asia Pacific (Mumbai)" },
    { code: "ap-northeast-1", name: "Asia Pacific (Tokyo)" },
    { code: "ap-northeast-2", name: "Asia Pacific (Seoul)" },
    { code: "ap-northeast-3", name: "Asia Pacific (Osaka)" },
    { code: "ap-southeast-1", name: "Asia Pacific (Singapore)" },
    { code: "ap-southeast-2", name: "Asia Pacific (Sydney)" },
    { code: "sa-east-1", name: "South America (São Paulo)" },
    { code: "af-south-1", name: "Africa (Cape Town)" },
    { code: "me-south-1", name: "Middle East (Bahrain)" },
    // Add or update newer ones as needed
  ],
  azure: [
    { code: "eastus", name: "East US" },
    { code: "eastus2", name: "East US 2" },
    { code: "centralus", name: "Central US" },
    { code: "northcentralus", name: "North Central US" },
    { code: "southcentralus", name: "South Central US" },
    { code: "westus", name: "West US" },
    { code: "westus2", name: "West US 2" },
    { code: "westus3", name: "West US 3" },
    { code: "canadacentral", name: "Canada Central" },
    { code: "canadaeast", name: "Canada East" },
    { code: "brazilsouth", name: "Brazil South" },
    { code: "northeurope", name: "North Europe (Ireland)" },
    { code: "westeurope", name: "West Europe (Netherlands)" },
    { code: "francecentral", name: "France Central (Paris)" },
    { code: "francesouth", name: "France South (Marseille)" },
    { code: "uksouth", name: "UK South (London)" },
    { code: "uaenorth", name: "UAE North (Dubai)" },
    { code: "eastasia", name: "East Asia (Hong Kong)" },
    { code: "southeastasia", name: "Southeast Asia (Singapore)" },
    { code: "centralindia", name: "Central India (Pune)" },
    { code: "southindia", name: "South India (Chennai)" },
    { code: "japaneast", name: "Japan East (Tokyo)" },
    { code: "japanwest", name: "Japan West (Osaka)" },
    { code: "germanynorth", name: "Germany North (Frankfurt)" },
    { code: "switzerlandnorth", name: "Switzerland North (Zurich)" },
    // Add more as per the latest list :contentReference[oaicite:0]{index=0}
  ],
  gcp: [
    { code: "us-central1", name: "US Central (Iowa)" },
    { code: "us-east1", name: "US East (South Carolina)" },
    { code: "us-east4", name: "US East (Northern Virginia)" },
    { code: "us-west1", name: "US West (Oregon)" },
    { code: "us-west2", name: "US West (Los Angeles)" },
    { code: "us-west3", name: "US West (Salt Lake City)" },
    { code: "asia-east1", name: "Asia East (Taiwan)" },
    { code: "asia-east2", name: "Asia East (Hong Kong)" },
    { code: "asia-northeast1", name: "Asia Northeast (Tokyo)" },
    { code: "asia-southeast1", name: "Asia Southeast (Singapore)" },
    { code: "asia-south1", name: "Asia South (Mumbai)" },
    { code: "asia-south2", name: "Asia South 2 (Delhi)" },
    { code: "europe-west1", name: "Europe West 1 (Belgium)" },
    { code: "europe-west2", name: "Europe West 2 (London)" },
    { code: "europe-west3", name: "Europe West 3 (Frankfurt)" },
    { code: "europe-west4", name: "Europe West 4 (Netherlands)" },
    {
      code: "northamerica-northeast1",
      name: "North America Northeast 1 (Montreal)",
    },
    {
      code: "northamerica-northeast2",
      name: "North America Northeast 2 (Toronto)",
    },
    { code: "southamerica-east1", name: "South America East 1 (São Paulo)" },
    // Add additional global regions as needed :contentReference[oaicite:1]{index=1}
  ],
};
