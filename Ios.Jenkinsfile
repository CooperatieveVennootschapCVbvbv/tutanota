pipeline {
    environment {
    	NODE_PATH="/opt/node-v16.3.0-linux-x64/bin"
    	NODE_MAC_PATH="/usr/local/opt/node@16/bin/"
    	VERSION = sh(returnStdout: true, script: "${NODE_PATH}/node -p -e \"require('./package.json').version\" | tr -d \"\n\"")
    }

    agent {
    	label 'linux'
    }

	parameters {
		booleanParam(name: 'PROD', defaultValue: false, description: 'Build for production')
		booleanParam(
			name: 'PUBLISH', defaultValue: false,
			description: "Publish the app to Nexus and Apple Store (when not in production mode, " +
						 "it will publish to Nexus only)"
		)
	}

	stages {
		stage("Build IOS app") {
			environment {
				PATH="${env.NODE_MAC_PATH}:${env.PATH}"
				MATCH_GIT_URL="git@gitlab:/tuta/apple-certificates.git"
				LC_ALL="en_US.UTF-8"
                LANG="en_US.UTF-8"
			}
		    agent {
            	label 'mac'
            }
			steps {
				script {
					createAppfile()

					def stage = params.PROD ? 'prod' : 'test'
					def lane = params.PROD ? 'release' : 'adhoc'
					def ipaFileName = "tutanota-${VERSION}.ipa"
					def fastlaneOpts = params.RELEASE ? "submit:true" : "submit:false"

					sh "npm ci"
					sh "node dist ${stage}"
					sh "node buildSrc/prepareMobileBuild.js dist"

					withCredentials([
						file(credentialsId: 'appstore-api-key-json', variable: "API_KEY_JSON_FILE_PATH"),
						string(credentialsId: 'match-password', variable: 'MATCH_PASSWORD'),
						string(credentialsId: 'team-id', variable: 'FASTLANE_TEAM_ID'),
						sshUserPrivateKey(credentialsId: 'jenkins', keyFileVariable: 'MATCH_GIT_PRIVATE_KEY'),
						string(credentialsId: 'fastlane-keychain-password', variable: 'FASTLANE_KEYCHAIN_PASSWORD')
					 ]) {
						dir('app-ios') {
							sh "security unlock-keychain -p ${FASTLANE_KEYCHAIN_PASSWORD}"
							sh "GIT_SSH_COMMAND=\"ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no\" fastlane ${lane}"
						}
					}

					stash includes: "app-ios/releases/${ipaFileName}", name: 'ipa'

					if (params.RELEASE && params.PROD) {
						def tag = "tutanota-ios-release-${VERSION}"
						sh "git tag ${tag}"
						sh "git push --tags"
					}
				}
			}
		}

		stage('Create github release') {
			environment {
				PATH="${env.NODE_PATH}:${env.PATH}"
			}
			when {
				expression { params.PROD }
				expression { params.PUBLISH }
			}
			agent {
				label 'linux'
			}
			steps {
				script {
					def tag = "tutanota-ios-release-${VERSION}"

					withCredentials([string(credentialsId: 'github-access-token', variable: 'GITHUB_TOKEN')]) {
						sh """node buildSrc/createGithubReleasePage.js --name '${VERSION} (IOS)' \
																	   --milestone '${VERSION}' \
																	   --tag '${tag}' \
																	   --platform ios """
					}
				}
			}
		}

		stage('Upload to Nexus') {
			environment {
				PATH="${env.NODE_PATH}:${env.PATH}"
			}
			when {
				expression { params.PUBLISH }
			}
			agent {
				label 'linux'
			}
			steps {
				script {
					def ipaFileName = "tutanota-${VERSION}.ipa"
					def artifactId = params.RELEASE ? "ios" : "ios-test"

					unstash 'ipa'

					publishToNexus(groupId: "app",
							artifactId: "${artifactId}",
							version: "${VERSION}",
							assetFilePath: "${WORKSPACE}/app-ios/releases/${ipaFileName}")
				}
			}
		}
	}
}

def createAppfile() {
	script {
		def app_identifier = 'de.tutao.tutanota'
		def appfile = './app-ios/fastlane/Appfile'

		sh "echo \"app_identifier('${app_identifier}')\" > ${appfile}"

		withCredentials([string(credentialsId: 'apple-id', variable: 'apple_id')]) {
			sh "echo \"apple_id('${apple_id}')\" >> ${appfile}"
		}
		withCredentials([string(credentialsId: 'itc-team-id', variable: 'itc_team_id')]) {
			sh "echo \"itc_team_id('${itc_team_id}')\" >> ${appfile}"
		}
		withCredentials([string(credentialsId: 'team-id', variable: 'team_id')]) {
			sh "echo \"team_id('${team_id}')\" >> ${appfile}"
		}
	}
}

def publishToNexus(Map params) {
	withCredentials([usernamePassword(credentialsId: 'nexus-publish', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
		sh  "curl --silent --show-error --fail " +
			"-u '${NEXUS_USERNAME}':'${NEXUS_PASSWORD}' " +
			// IP points to http://next.tutao.de/nexus, but we can't use the hostname due to reverse proxy configuration
			"-X POST 'http://[fd:aa::70]:8081/nexus/service/rest/v1/components?repository=releases' " +
			"-F maven2.groupId=${params.groupId} " +
			"-F maven2.artifactId=${params.artifactId} " +
			"-F maven2.version=${params.version} " +
			"-F maven2.generate-pom=true " +
			"-F maven2.asset1=@${params.assetFilePath} " +
			"-F maven2.asset1.extension=ipa"
	}
}