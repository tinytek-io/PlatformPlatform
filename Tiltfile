version_settings(check_updates=True, constraint='>=0.33.18')

applicationFolder = 'application'

appFolder = 'application/account-management'

# load('ext://dotenv', 'dotenv')
# dotenv("%s/.env" % appFolder)

docker_compose("./infrastructure/local/docker-compose.yml")

dc_resource('postgres', labels=["infra"])
dc_resource('redis', labels=["infra"])
dc_resource('mailserver', labels=["infra"])
dc_resource('storage', labels=["infra"])
dc_resource('sslproxy', labels=["infra"])
dc_resource('otel', labels=["infra"], links=['http://localhost:9001'])

local_resource(
  'dependencies',
  dir=applicationFolder,
  cmd='npm install',
  deps=['package-lock.json'],
  labels=['dependencies'],
)

shared_webapp_list = ['build', 'infrastructure', 'ui', 'utils', 'api-core']
system_list = ['account-management', 'back-office']

def shared_library(type, name):
  shared_path = "%s/%s" % (applicationFolder, type)
  local_resource(
    name,
    dir="%s/%s" % (shared_path, name),
    resource_deps=['dependencies'],
    serve_dir = "%s/%s" % (shared_path, name),
    serve_cmd='npm run dev',
    labels=[type]
  )

def system(name, system_nr):
  system_path = "%s/%s" % (applicationFolder, name)
  local_resource(
    'WebApp %s' % name,
    dir="%s/WebApp" % system_path,
    resource_deps=shared_webapp_list,
    serve_dir = "%s/WebApp" % system_path,
    serve_cmd='npm run dev',
    labels=[name],
    links=['https://local.tinytek.dev', 'https://lucide.dev/icons/', "https://localhost:9%s01" % system_nr],
    serve_env={
      'PORT': '9%s01' % system_nr,
    },
    deps=[".env"],
  )
  local_resource(
    'Api %s' % name,
    dir="%s/Api" % system_path,
    resource_deps=['dependencies'],
    serve_dir = "%s/Api" % system_path,
    serve_cmd='bun run dev',
    labels=[name],
    links=["https://localhost:9%s00" % system_nr],
    serve_env={
      'PORT': '9%s00' % system_nr,
      'PUBLIC_URL': 'https://local.tinytek.dev',
      'CDN_URL': 'https://localhost:9%s01' % system_nr,
      'REDIS_URL': 'redis://localhost:6379',
    },
    deps=[".env"],
    readiness_probe=probe(
      initial_delay_secs=2,
      period_secs=15,
      http_get=http_get_action(scheme="https", port=int('9%s00' % system_nr), path="/internal/%s/healthcheck" % name)
    )
  )

  cmd_button('Prisma push %s' % name,
    argv=['sh', '-c', 'cd %s/Api && npm run prisma:push' % system_path],
    resource='Api %s' % name,
    icon_name='cloud_upload',
    text='Prisma push',
  )

  cmd_button('Prisma seed %s' % name,
    argv=['sh', '-c', 'cd %s/Api && npm run prisma:seed' % system_path],
    resource='Api %s' % name,
    icon_name='cloud_done',
    text='Prisma seed',
  )

  cmd_button('Prisma reset %s' % name,
    argv=['sh', '-c', 'cd %s/Api && npm run prisma:reset' % system_path],
    resource='Api %s' % name,
    icon_name='cloud',
    text='Prisma reset',
  )

  cmd_button('Prisma create migration %s' % name,
    argv=['sh', '-c', 'cd %s/Api && npm run prisma:migration:create' % system_path],
    resource='Api %s' % name,
    icon_name='cloud',
    text='Prisma create migration',
  )

  cmd_button('Prisma apply migrations %s' % name,
    argv=['sh', '-c', 'cd %s/Api && npm run prisma:migration:apply' % system_path],
    resource='Api %s' % name,
    icon_name='cloud',
    text='Prisma apply migrations',
  )

  cmd_button('Lingui extract Api %s' % name,
    argv=['sh', '-c', 'cd %s/Api && npm run update-translations' % system_path],
    resource='Api %s' % name,
    icon_name='translate',
    text='Lingui extract',
  )

  cmd_button('Lingui extract WebApp %s' % name,
    argv=['sh', '-c', 'cd %s/WebApp && npm run update-translations' % system_path],
    resource='WebApp %s' % name,
    icon_name='translate',
    text='Lingui extract',
  )

  local_resource(
    'Resend Preview %s' % name,
    resource_deps=['mailserver'],
    serve_dir = "%s/Api" % system_path,
    serve_cmd='npx email dev --port=9%s50' % system_nr,
    labels=[name],
    links=['http://localhost:9%s50' % system_nr],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
    serve_env={
      'BASE_URL': 'http://localhost:9%s50' % system_nr,
    },
  )

  local_resource(
    'Prisma Studio %s' % name,
    resource_deps=['postgres'],
    serve_dir = "%s/WebApp" % system_path,
    dir="%s/WebApp" % system_path,
    serve_cmd='npx prisma studio --browser none --port 9%s51' % system_nr,
    labels=[name],
    links=['http://localhost:9%s51' % system_nr],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
  )

# Helper UI buttons
# https://fonts.google.com/icons
load('ext://uibutton', 'cmd_button')

for name in shared_webapp_list:
  shared_library("shared-webapp", name)

for index, name in enumerate(system_list):
  system(name, 1 + index)
