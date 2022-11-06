terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.29.1"
    }

    azuread = {
      version = "=1.6.0"
    }

    azapi = {
      source  = "azure/azapi"
      version = "=1.0.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "__terraform-resource-group__"
    storage_account_name = "__terraform-storage-account__"
    container_name       = "__terraform-container__"
    key                  = "__terraform-state-file__"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
}

provider "azuread" {
  use_microsoft_graph = true
}

provider "azapi" {
}
