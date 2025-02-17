import logging
import datetime
import azure.functions as func
from utils.azure_functions import time_trigger_azure_func


def main(mytimer: func.TimerRequest) -> None:
    try:
        utc_timestamp = (
            datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).isoformat()
        )

        if mytimer.past_due:
            logging.info("The timer is past due!")

        logging.info("TIME TRIGGER AZURE FUNCTION RAN AT %s", utc_timestamp)
        time_trigger_azure_func()
    except Exception as e:
        logging.debug("Something went wrong while time trigger: {}".format(e))
        
        raise e
