param name string
param location string
param tags object
param resourceGroupName string
param containerAppsEnvironmentId string
param containerAppsEnvironmentName string
param containerRegistryName string
param containerImageName string
param containerImageTag string
param cpu string = '0.25'
param memory string = '0.5Gi'
param minReplicas int = 1
param maxReplicas int = 3
param userAssignedIdentityName string
param ingress bool
param hasProbesEndpoint bool
param domainName string = ''
param isDomainConfigured bool = false
param external bool = false
param environmentVariables object[] = []
param uniqueSuffix string = substring(newGuid(), 0, 4)

resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  scope: resourceGroup(resourceGroupName)
  name: userAssignedIdentityName
}

var certificateName = '${domainName}-certificate' // Note: The `-certificate` is used to detect if a certificate in deploy-cluster.sh
var isCustomDomainSet = domainName != ''

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-02-preview' existing =
  if (isCustomDomainSet) {
    name: containerAppsEnvironmentName
  }

module newManagedCertificate './managed-certificate.bicep' =
  if (isCustomDomainSet) {
    name: '${resourceGroupName}-${name}-managed-certificate'
    scope: resourceGroup(resourceGroupName)
    dependsOn: [containerApp]
    params: {
      name: certificateName
      location: location
      tags: tags
      containerAppsEnvironmentName: containerAppsEnvironmentName
      domainName: domainName
    }
  }

resource existingManagedCertificate 'Microsoft.App/managedEnvironments/managedCertificates@2023-05-02-preview' existing =
  if (isDomainConfigured) {
    name: certificateName
    parent: containerAppsEnvironment
  }

var customDomainConfiguration = isCustomDomainSet
  ? [
      {
        bindingType: isDomainConfigured ? 'SniEnabled' : 'Disabled'
        name: domainName
        certificateId: isDomainConfigured ? existingManagedCertificate.id : null
      }
    ]
  : []

// For the initial revision, we use the container image hello world quickstart image.
// This allows for the container app to be created before the container image is pushed to the registry.
var useQuickStartImage = containerImageTag == 'initial'
var containerRegistryServerUrl = '${containerRegistryName}.azurecr.io'
var image = useQuickStartImage ? 'ghcr.io/TypeScriptPlatform/quickstart:latest' : '${containerRegistryServerUrl}/${containerImageName}:${containerImageTag}'

// Create a revisionSuffix that contains the version but is be unique for each deployment. E.g. "2024-4-24-1557-tzyb"
var revisionSuffix = '${replace(containerImageTag, '.', '-')}-${substring(uniqueSuffix, 0, 4)}'

resource containerApp 'Microsoft.App/containerApps@2023-05-02-preview' = {
  name: name
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    environmentId: containerAppsEnvironmentId
    template: {
      containers: [
        {
          name: name
          image: image
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          env: environmentVariables
          probes: hasProbesEndpoint && containerImageTag != 'initial' // The quickstart image does not have liveness and readiness probes
            ? [
                {
                  type: 'Liveness'
                  httpGet: {
                    path: '/internal-api/live'
                    port: 8080
                    scheme: 'HTTP'
                  }
                  initialDelaySeconds: 3
                  failureThreshold: 3
                  periodSeconds: 5
                  successThreshold: 1
                  timeoutSeconds: 1
                }
                {
                  type: 'Readiness'
                  httpGet: {
                    path: '/internal-api/ready'
                    port: 8080
                    scheme: 'HTTP'
                  }
                  initialDelaySeconds: 3
                  failureThreshold: 3
                  periodSeconds: 6
                  successThreshold: 1
                  timeoutSeconds: 5
                }
              ]
            : [
                {
                  type: 'Liveness'
                  failureThreshold: 3
                  periodSeconds: 10
                  successThreshold: 1
                  tcpSocket: {
                    port: 8080
                  }
                  timeoutSeconds: 1
                }
                {
                  type: 'Readiness'
                  failureThreshold: 48
                  initialDelaySeconds: 3
                  periodSeconds: 5
                  successThreshold: 1
                  tcpSocket: {
                    port: 8080
                  }
                  timeoutSeconds: 5
                }
              ]
        }
      ]
      revisionSuffix: revisionSuffix
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
    configuration: {
      registries: [
        {
          server: containerRegistryServerUrl
          identity: userAssignedIdentity.id
        }
      ]
      ingress: ingress ? {
        external: external
        targetPort: 8080
        exposedPort: 0
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
        customDomains: customDomainConfiguration
        stickySessions: null
      } : null
    }
  }
}

output containerAppUrl string = containerApp.properties.configuration.ingress != null ? containerApp.properties.configuration.ingress.fqdn : ''
