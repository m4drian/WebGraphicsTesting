import re
import glob
import os

def extract_numbers(text,prevTaskTime,extracted_data):
  ts_match = re.search(r'"ts":(\d+)}', text)
  if ts_match:
    print(str(prevTaskTime) + " " + str(len(extracted_data)))
    start_match = re.search(r'"startTime":(-?\d+\.\d+)', text)
    if prevTaskTime!=0:
      if start_match:
        #print(str(start_match.group(1)) + " ")
        prevTaskTime = int(ts_match.group(1))
      else:
        curTaskTime = int(ts_match.group(1))
        extracted_data.append(curTaskTime-prevTaskTime)
        prevTaskTime = 0
    else:
      if start_match:
        prevTaskTime = int(ts_match.group(1))
  return prevTaskTime, extracted_data

def save_to_file(data, filename):
  with open(filename, 'w') as f:
    for d in data:
      f.write(f"{d},\n")

def extract_cpu_task_lines(filename):
  with open(filename, 'r') as f:
    cpu_task_lines = [line for line in f if '"name":"cpu-duration"' in line]
    extracted_data = []

    prevTaskTime = 0
    for line in cpu_task_lines:
      #print(line + '\n')
      prevTaskTime, extracted_data = extract_numbers(line,prevTaskTime,extracted_data)

    save_to_file(extracted_data, f"{filename}" + "CPUoutput.csv")

def process_json_files(directory):
  for filename in glob.glob(os.path.join(directory, '*.json')):
    extract_cpu_task_lines(filename)

directory = "./Logs/"
process_json_files(directory)