import json
import time
import subprocess
import requests
from requests.auth import HTTPProxyAuth
import os
import random

def get_random_proxy() -> str:
    with open("./files/proxyes.txt") as f:
        proxyes = f.readlines()
        proxy = proxyes[random.randrange(0, len(proxyes))]
        proxy = proxy.replace("\n", "")

    return proxy

def modify_config(invite_code: str):
    # Modify the config.json file
    config_path = "./files/config.json"
    with open(config_path, "r") as config_file:
        config_data = json.load(config_file)
        config_data["inviteCode"] = invite_code

    with open(config_path, "w") as config_file:
        json.dump(config_data, config_file, indent=4)


def update_tokens(tokens: list):
    # Add the token to the tokens.json file
    tokens_path = "./files/tokens.txt"
    tokens_data = []
    for token in tokens:
        tokens_data.append(f"{token}\n")

    with open(tokens_path, "w") as tokens_file:
        tokens_file.writelines(tokens_data)


def main():
    processes = []
    runner_config = "runner_config.json"
    instances_file = "instances_data.txt"
    with open(f"./files/{runner_config}", "r") as file:
        runner_data = json.load(file)
        use_tmux = runner_data["use_tmux"]
        logs_dir = runner_data["logs_dir"]

    # Get the tokens from instances_data.txt
    with open(f"./files/{instances_file}", "r") as file:
        lines = file.readlines()
        for index, line in enumerate(lines):
            data = line.strip().split(";")[0].strip().split(",")
            *tokens, invite_code = data
            modify_config(invite_code)
            update_tokens(tokens)

            random_proxy = get_random_proxy()
            splited_url = random_proxy.split("@")
            url = splited_url[1]
            url = f"http://{url}"

            user_password = splited_url[0]
            username, password = user_password.replace("http://", "").split(":")
            proxy_auth = HTTPProxyAuth(username=username, password=password)

            print(f"🔗 Using proxy:\n\tURL: {url}\n\tUsername: {username}\n\tPassword: {password}\n\tFull: {random_proxy}")

            # Get the discord username
            try:
                response = requests.get(f"https://discord.com/api/invites/{invite_code}",
                    proxies={
                        "http": url
                    },
                    auth=proxy_auth
                )
                
                if response.status_code == 200:
                    guild_name = response.json()["guild"]["name"].replace(" ", "_")
                else:
                    print(f"❌ There was an error during the request. Status code: {response.status_code}")
                    guild_name = f"{index}-{invite_code}"
            except Exception as err:
                print("❌ There was an error during the request ")
                print(err)


            # Start main.py
            if use_tmux:
                if logs_dir[-1] == "/" or logs_dir[-1] == "\\":
                    formatted_logs_dir = logs_dir[:-1] + "/"
                else:
                    formatted_logs_dir = logs_dir + "/"
                os.system(f"mkdir -p {formatted_logs_dir}")

                command = [
                    "tmux",
                    "new",
                    "-d",
                    "-s",
                    f"server-joiner-{guild_name}",
                    f"exec node ./dist/index.js 2>&1 | tee -a {formatted_logs_dir}{guild_name}.log",
                ]

                try:
                    process = subprocess.Popen(command)
                    process.communicate()
                    processes.append(process)
                    print(
                        f"☕ [TMUX] Process started: Guild name: {guild_name}, Invite code: {invite_code}"
                    )
                    time.sleep(1)
                except subprocess.CalledProcessError as e:
                    print(f"Errore nell'esecuzione del comando: {e}")
                except Exception as e:
                    print(f"Errore sconosciuto: {e}")
            else:
                process = subprocess.Popen(["node", "./dist/index.js"])
                processes.append(process)
                print(
                    f"☕ [CONSOLE] Process started: Guild name: {guild_name}, Invite code: {invite_code}"
                )
                time.sleep(1)

    print(f"⭐ All processes were started for a total of {len(processes)} processes ⭐")


if __name__ == "__main__":
    main()
