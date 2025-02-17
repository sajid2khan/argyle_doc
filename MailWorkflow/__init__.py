import logging
from azure.functions import QueueMessage
from utils.azure_functions import queue_trigger_azure_func
import time
from utils.helper import delete_message_from_queue, retry_count_logic

def main(msg: QueueMessage) -> None:
    try:
        start_time = time.time()

        logging.info(
            "PYTHON QUEUE TRIGGER FUNCTION PROCESSED A QUEUE ITEM: %s",
            msg.get_body().decode("utf-8"),
        )
        
        # Get the message ID and pop_receipt from the queue message
        message_id = msg.id
        pop_receipt = msg.pop_receipt        
        logging.info("Message version id: {}".format(message_id))

        message_content = msg.get_body().decode("utf-8")
        message_content_dict = eval(message_content)
        
        # Process the message here
        is_delete_message = queue_trigger_azure_func(message_content_dict, message_id)
        
        if is_delete_message:
            # Manually delete the message after message processing
            delete_message_from_queue(message_id, pop_receipt)
        
            logging.info("Message {} deleted successfully!".format(message_id))
            logging.info('Total processing time of queue message: {} secs'.format(time.time() - start_time))
        else:
            retry_count_logic(message_content_dict, message_id, pop_receipt)                

    except Exception as e:
        logging.error("Error while processing original queue message: {}".format(e))
        
        # Retry up to max retry count
        retry_count_logic(message_content_dict, message_id, pop_receipt)
