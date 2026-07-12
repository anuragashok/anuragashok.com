---
title: "Publishing my first artifact to maven central using GitHub actions"
date: 2021-02-27
summary: "I wanted to publish the build artifacts of my wiremock extension to maven central. Some changes were needed for the project to be accepted to maven central. This post summarizes these changes and the process of automation using Github Actions."
tags: ["maven"]
---

![Publishing my first artifact to maven central using GitHub actions](./img/github_and_maven__1_.jpg)
*Photo by [Ferenc Almasi](https://unsplash.com/@flowforfrank?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/programming-publish?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)*

I recently published a post on how to record response time with wiremock. Later, I created a java library out of it and published it on Github.

I wanted to go a step further and publish the build artifacts to maven central. Fellow developers can then use them without building from source code. Some changes were needed for the project to be accepted to maven central. This post summarizes these changes and the process of automation using Github Actions.

### Overall Process

The artifacts cannot be pushed to maven central directly. They first need to be deployed to the Sonatype OSSRH (OSS Repository Hosting) staging repository. Releasing from OSSRH to the maven central can then be initiated manually or via a maven plugin (more on that later). Before release, various checks are done against the project and artifacts to ensure they meet the standards of maven central. The artifacts are synced to maven central only if all the checks pass.

The detailed steps for meeting the standard and publishing are as follows.

### 1. Create a project and request access to maven central.

Most importantly, you need an account, a project, and permission to publish to OSJRH. You will need to create an account on Sonatype JIRA and then request to create your project via a new JIRA ticket. You can also clone, edit and submit the Jira ticket I created - [OSSRH-64328](https://issues.sonatype.org/browse/OSSRH-64328).

The group-id should follow Maven naming conventions and be the reverse of a domain you own. For projects hosted on GitHub, it can start with `com.github` or `io.github`.

The folks at sonatype were very quick in their responses and asked to create a repository on GitHub with the Jira ID as the name to verify ownership of the GitHub account. Once ownership was verified, they quickly prepared the group for publishing and deployment to the staging repository.

### 2. Signing Artifacts / GPG setup

One of the requirements is that the artifacts are signed with GPG. To do this, you first need to create a GPG key using the command 'gpg --gen-key' or tools like GnuPG. You will need to enter a few details and a passphrase to remember.

Once the keys are created, you need to sync the public keys with popular gpg key servers. You can synchronize the keys by retrieving the public key and then sending it to the keyservers.

Example:

###### [gpg.sh](https://gist.github.com/anuragashok/fab99a3db9e0cae020ce01b6ab749bb9#file-gpg-sh)

```bash
bash-3.2$ gpg --list-keys
.
.
.

pub   rsa3072 2021-02-21 [SC] [expires: 2023-02-21]
      06E79979185C8ADE85EFBA3078965665F6F2D044
uid           [ultimate] Anurag Ashok <anurag@anuragashok.com>
sub   rsa3072 2021-02-21 [E] [expires: 2023-02-21]

bash-3.2$ gpg --keyserver hkp://pool.sks-keyservers.net --send-keys 06E79979185C8ADE85EFBA3078965665F6F2D044
```

Once the public key is sent to one of the keyservers, it is automatically, but not immediately, synchronized with the other keyservers. You can also send it manually to the most common servers instead of waiting for synchronization. The most common servers are:

hkp://pool.sks-keyservers.net

[https://pgp.key-server.io/](https://pgp.key-server.io/)

[https://keyserver.ubuntu.com/](https://keyserver.ubuntu.com/)

[https://pgp.mit.edu/](https://pgp.mit.edu/)

[http://keys.gnupg.net/](http://keys.gnupg.net/)

You can read more detailed instructions on the [sonatype page on pgp signatures](https://central.sonatype.org/pages/working-with-pgp-signatures.html).

Once the GPG key is created, you need to add the following plugin to your pom to sign the artifacts.

###### [gpg-plugin-pom.xml](https://gist.github.com/anuragashok/fab99a3db9e0cae020ce01b6ab749bb9#file-gpg-plugin-pom-xml)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-gpg-plugin</artifactId>
    <executions>
        <execution>
            <id>sign-artifacts</id>
            <phase>verify</phase>
            <goals>
                <goal>sign</goal>
            </goals>
            <configuration>
                <gpgArguments>
                    <arg>--pinentry-mode</arg>
                    <arg>loopback</arg>
                </gpgArguments>
            </configuration>
        </execution>
    </executions>
</plugin>
```

The pinentry-mode=loopback specification is necessary for automated builds. It tells GPG not to ask for the passphrase to be entered manually. We'll see how to provide the passphrase when we set up GitHub actions.

### 3. Adding metadata to the POM

Artifacts must have a minimal set of metadata before they are eligible for release to Maven Central. The metadata includes fields such as developer name, SCM URLs, licenses, etc. You can find the full list and details on the [sonatype requirements page](https://central.sonatype.org/pages/requirements.html#sufficient-metadata). You can also reference the [pom of my project](https://github.com/anuragashok/wiremock-extension-record-delay/commit/11b6188041867dfaf936998e866cc08d7372e02d#diff-9c5fb3d1b7e3b0f54bc5c4182965c4fe1f9023d449017cece3005d3f90e8e4d8).

### 4. Generate JavaDoc and sources jar.

Maven central also requires us to generate the JavaDoc and sources jar for consumer use. This is mandatory for projects with a packaging type other than `pom`. You can generate this by adding and configuring their respective Maven plugins to your pom.

###### [javadoc-source-plugin-pom.xml](https://gist.github.com/anuragashok/fab99a3db9e0cae020ce01b6ab749bb9#file-javadoc-source-plugin-pom-xml)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <id>attach-javadoc</id>
            <goals>
                <goal>jar</goal>
            </goals>
        </execution>
    </executions>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-source-plugin</artifactId>
    <executions>
        <execution>
            <id>attach-source</id>
            <goals>
                <goal>jar</goal>
            </goals>
        </execution>
    </executions>
</plugin>
</plugin>
```

You can also see the plugins section in my [project](https://github.com/anuragashok/wiremock-extension-record-delay/commit/11b6188041867dfaf936998e866cc08d7372e02d#diff-9c5fb3d1b7e3b0f54bc5c4182965c4fe1f9023d449017cece3005d3f90e8e4d8).

### 5. Prepare POM for deployment

You need to add the URL of the distribution repository to the pom of the project. In this case, we add the staging repository as the distribution repository.

###### [distribution-management-pom.xml](https://gist.github.com/anuragashok/fab99a3db9e0cae020ce01b6ab749bb9#file-distribution-management-pom-xml)

```xml
<distributionManagement>
    <repository>
        <id>ossrh</id>
        <name>Central Repository OSSRH</name>
        <url>https://oss.sonatype.org/service/local/staging/deploy/maven2/</url>
    </repository>
</distributionManagement>
```

By default, the staged artifacts must be manually from the sonatype next staging website. However, this can be automated by adding the `nexus-staging-maven-plugin` to the project pom.

###### [nexus-staging-maven-plugin-pom.xml](https://gist.github.com/anuragashok/fab99a3db9e0cae020ce01b6ab749bb9#file-nexus-staging-maven-plugin-pom-xml)

```xml
<plugin>
    <groupId>org.sonatype.plugins</groupId>
    <artifactId>nexus-staging-maven-plugin</artifactId>
    <version>1.6.7</version>
    <extensions>true</extensions>
    <configuration>
        <serverId>ossrh</serverId>
        <nexusUrl>https://oss.sonatype.org/</nexusUrl>
        <autoReleaseAfterClose>true</autoReleaseAfterClose>
    </configuration>
</plugin>
```

After the artifact is deployed to the staging repository, the plugin attempts to release the artifact. If any of the checks/requirements for release are not met, the build also fails. The plugin also outputs the list of unmet requirements.

### 6. Automate deployment to staging and release using GitHub Actions

I use GitHub Actions as a CI CD tool. The workflow code is as follows.

###### [release-action.yml](https://gist.github.com/anuragashok/fab99a3db9e0cae020ce01b6ab749bb9#file-release-action-yml)

```yaml
name: release and push to central
on:
  push:
    tags:
      - '*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Java for publishing to Maven Central Repository
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
          server-id: ossrh
          server-username: MAVEN_USERNAME
          server-password: MAVEN_PASSWORD
          gpg-private-key: ${{ secrets.OSSRH_GPG_SECRET_KEY }}
          gpg-passphrase: MAVEN_GPG_PASSPHRASE
      - name: build artifact
        run: mvn clean package
      - name: Create release
        uses: ncipollo/release-action@v1
        with:
          allowUpdates: true
          artifacts: "${{ github.workspace }}/target/*.jar"
          token: ${{ secrets.GITHUB_TOKEN }}
      - name: Publish to the Maven Central Repository
        run: |
          mvn \
            --no-transfer-progress \
            --batch-mode \
            deploy
        env:
          MAVEN_USERNAME: ${{ secrets.OSSRH_USERNAME }}
          MAVEN_PASSWORD: ${{ secrets.OSSRH_TOKEN }}
          MAVEN_GPG_PASSPHRASE: ${{ secrets.OSSRH_GPG_SECRET_KEY_PASSWORD }}
```

This workflow is triggered when I push a new tag. The workflow then builds the artifact, creates a GitHub release, and then deploys it to the staging repository. The 'nexus-staging-maven-plugin' added in the pom automatically releases the staged artifact when all checks pass.

The workflow requires a few secrets to be provided via the repository settings. More details can be found on the [GitHub action pages](https://docs.github.com/en/actions/reference/encrypted-secrets). The following secrets need to be added.

**OSSRH_USERNAME** : the username for the sonatype Jira login

**OSSRH_PASSWORD**: the password for the sonatype Jira login

**OSSRH_GPG_SECRET_KEY**:  gpg private key ( `gpg --armor --export-secret-keys YOUR_KEY_ID` )

**OSSRH_GPG_SECRET_KEY_PASSWORD** : gpg passphrase

### 7. Enable synchronization after first release.

This step is only needed on the first release. You need to inform the sonatype team via a comment on the project creation JIRA ticket when you release your first artifact. The sonatype team then enabled sync to maven central for the project. Once that is done, the artifact appears in maven central in about 10 mins and on the search page in a couple of hours.

---

The entire process for publishing on Maven Central seems long and complex, but most of these steps are one-time. Automating the rest with a CI CD tool makes publishing subsequent versions trivial.

You can reference my project [wiremock-extension-record-delay](https://github.com/anuragashok/wiremock-extension-record-delay) for the complete setup.
