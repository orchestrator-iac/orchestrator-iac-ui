export type CloudProvider = "aws" | "azure" | "gcp";

export interface CloudConfig {
  templateName: string;
  description: string;
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

// Comprehensive mapping of Availability Zones for each cloud provider and region
export const availabilityZones: Record<string, Record<string, string[]>> = {
  aws: {
    // US Regions
    "us-east-1": ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1e", "us-east-1f"],
    "us-east-2": ["us-east-2a", "us-east-2b", "us-east-2c"],
    "us-west-1": ["us-west-1a", "us-west-1b", "us-west-1c"],
    "us-west-2": ["us-west-2a", "us-west-2b", "us-west-2c", "us-west-2d"],
    
    // Canada
    "ca-central-1": ["ca-central-1a", "ca-central-1b", "ca-central-1d"],
    
    // Europe Regions
    "eu-west-1": ["eu-west-1a", "eu-west-1b", "eu-west-1c"],
    "eu-west-2": ["eu-west-2a", "eu-west-2b", "eu-west-2c"],
    "eu-west-3": ["eu-west-3a", "eu-west-3b", "eu-west-3c"],
    "eu-central-1": ["eu-central-1a", "eu-central-1b", "eu-central-1c"],
    "eu-north-1": ["eu-north-1a", "eu-north-1b", "eu-north-1c"],
    "eu-south-1": ["eu-south-1a", "eu-south-1b", "eu-south-1c"],
    
    // Asia Pacific Regions
    "ap-south-1": ["ap-south-1a", "ap-south-1b", "ap-south-1c"],
    "ap-northeast-1": ["ap-northeast-1a", "ap-northeast-1b", "ap-northeast-1c", "ap-northeast-1d"],
    "ap-northeast-2": ["ap-northeast-2a", "ap-northeast-2b", "ap-northeast-2c", "ap-northeast-2d"],
    "ap-northeast-3": ["ap-northeast-3a", "ap-northeast-3b", "ap-northeast-3c"],
    "ap-southeast-1": ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"],
    "ap-southeast-2": ["ap-southeast-2a", "ap-southeast-2b", "ap-southeast-2c"],
    
    // South America
    "sa-east-1": ["sa-east-1a", "sa-east-1b", "sa-east-1c"],
    
    // Africa
    "af-south-1": ["af-south-1a", "af-south-1b", "af-south-1c"],
    
    // Middle East
    "me-south-1": ["me-south-1a", "me-south-1b", "me-south-1c"],
  },
  
  azure: {
    // Azure uses numbered zones (1, 2, 3) instead of lettered suffixes
    // Format: region-zone (e.g., "eastus-1", "eastus-2")
    "eastus": ["eastus-1", "eastus-2", "eastus-3"],
    "eastus2": ["eastus2-1", "eastus2-2", "eastus2-3"],
    "centralus": ["centralus-1", "centralus-2", "centralus-3"],
    "northcentralus": ["northcentralus-1", "northcentralus-2", "northcentralus-3"],
    "southcentralus": ["southcentralus-1", "southcentralus-2", "southcentralus-3"],
    "westus": ["westus-1", "westus-2", "westus-3"],
    "westus2": ["westus2-1", "westus2-2", "westus2-3"],
    "westus3": ["westus3-1", "westus3-2", "westus3-3"],
    "canadacentral": ["canadacentral-1", "canadacentral-2", "canadacentral-3"],
    "canadaeast": ["canadaeast-1", "canadaeast-2", "canadaeast-3"],
    "brazilsouth": ["brazilsouth-1", "brazilsouth-2", "brazilsouth-3"],
    "northeurope": ["northeurope-1", "northeurope-2", "northeurope-3"],
    "westeurope": ["westeurope-1", "westeurope-2", "westeurope-3"],
    "francecentral": ["francecentral-1", "francecentral-2", "francecentral-3"],
    "francesouth": ["francesouth-1", "francesouth-2", "francesouth-3"],
    "uksouth": ["uksouth-1", "uksouth-2", "uksouth-3"],
    "uaenorth": ["uaenorth-1", "uaenorth-2", "uaenorth-3"],
    "eastasia": ["eastasia-1", "eastasia-2", "eastasia-3"],
    "southeastasia": ["southeastasia-1", "southeastasia-2", "southeastasia-3"],
    "centralindia": ["centralindia-1", "centralindia-2", "centralindia-3"],
    "southindia": ["southindia-1", "southindia-2", "southindia-3"],
    "japaneast": ["japaneast-1", "japaneast-2", "japaneast-3"],
    "japanwest": ["japanwest-1", "japanwest-2", "japanwest-3"],
    "germanynorth": ["germanynorth-1", "germanynorth-2", "germanynorth-3"],
    "switzerlandnorth": ["switzerlandnorth-1", "switzerlandnorth-2", "switzerlandnorth-3"],
  },
  
  gcp: {
    // GCP uses lettered zones (a, b, c, d, etc.)
    "us-central1": ["us-central1-a", "us-central1-b", "us-central1-c", "us-central1-f"],
    "us-east1": ["us-east1-b", "us-east1-c", "us-east1-d"],
    "us-east4": ["us-east4-a", "us-east4-b", "us-east4-c"],
    "us-west1": ["us-west1-a", "us-west1-b", "us-west1-c"],
    "us-west2": ["us-west2-a", "us-west2-b", "us-west2-c"],
    "us-west3": ["us-west3-a", "us-west3-b", "us-west3-c"],
    "asia-east1": ["asia-east1-a", "asia-east1-b", "asia-east1-c"],
    "asia-east2": ["asia-east2-a", "asia-east2-b", "asia-east2-c"],
    "asia-northeast1": ["asia-northeast1-a", "asia-northeast1-b", "asia-northeast1-c"],
    "asia-southeast1": ["asia-southeast1-a", "asia-southeast1-b", "asia-southeast1-c"],
    "asia-south1": ["asia-south1-a", "asia-south1-b", "asia-south1-c"],
    "asia-south2": ["asia-south2-a", "asia-south2-b", "asia-south2-c"],
    "europe-west1": ["europe-west1-b", "europe-west1-c", "europe-west1-d"],
    "europe-west2": ["europe-west2-a", "europe-west2-b", "europe-west2-c"],
    "europe-west3": ["europe-west3-a", "europe-west3-b", "europe-west3-c"],
    "europe-west4": ["europe-west4-a", "europe-west4-b", "europe-west4-c"],
    "northamerica-northeast1": ["northamerica-northeast1-a", "northamerica-northeast1-b", "northamerica-northeast1-c"],
    "northamerica-northeast2": ["northamerica-northeast2-a", "northamerica-northeast2-b", "northamerica-northeast2-c"],
    "southamerica-east1": ["southamerica-east1-a", "southamerica-east1-b", "southamerica-east1-c"],
  },
};
