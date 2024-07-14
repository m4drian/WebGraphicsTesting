import re
import glob
import os

def calculate_durations_per_second(data):
  result = []
  current_second = data[0][0] // 1000000  # Convert first timestamp to seconds
  total_duration = 0

  for timestamp, duration in data:
    second = timestamp // 1000000
    if second != current_second:
      result.append((current_second, total_duration))
      current_second = second
      total_duration = 0
    total_duration += duration

  # Add the last second's data
  result.append((current_second, total_duration))

  return result

def extract_numbers(text):
  dur_match = re.search(r'"dur":(\d+),', text)
  ts_match = re.search(r'"ts":(\d+),', text)
  if dur_match and ts_match:
    return dur_match.group(1), ts_match.group(1)
  else:
    return None, None

def save_to_file(data, filename):
  with open(filename, 'w') as f:
    for timestamp, duration in data:
      f.write(f"{timestamp},{duration}\n")

def extract_gpu_task_lines(filename):
  with open(filename, 'r') as f:
    gpu_task_lines = [line for line in f if '"name":"GPUTask"' in line]
    extracted_data = []
    for line in gpu_task_lines:
      dur, ts = extract_numbers(line)
      extracted_data.append((int(ts), int(dur)))

    durations_per_second = calculate_durations_per_second(extracted_data)

    save_to_file(durations_per_second, f"{filename}" + "GPUoutput.txt")

def process_trace_files(directory):
  for filename in glob.glob(os.path.join(directory, 'Trace-*.json')):
    extract_gpu_task_lines(filename)

directory = "./Logs/"
process_trace_files(directory)